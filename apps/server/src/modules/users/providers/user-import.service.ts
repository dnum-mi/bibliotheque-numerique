import { BadRequestException, Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { User } from '@/modules/users/objects/user.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { IRole, IRoleOption, PrefectureDictionary, PrefectureKey, Roles } from '@biblio-num/shared'
import { CreateUserDto } from '@/modules/users/objects/dtos/input'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import { ExcelUser } from '@/modules/users/objects/types/excel-user.type'

@Injectable()
export class UserImportService {
  constructor(
    private readonly logger: LoggerService,
    @InjectRepository(User) protected readonly repo: Repository<User>,
    private readonly demarcheService: DemarcheService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private formatDepartment(department: string | number): PrefectureKey {
    let result: string
    if (typeof department === 'string') {
      const d: string = department.trim()
      result = 'D' + (d.length === 1 ? '0' + d : d)
    } else if (typeof department === 'number') {
      result = 'D' + (department < 10 ? '0' + department : department.toString())
    }
    if (!PrefectureDictionary[result]) {
      throw new Error(`Department ${result} does not exist`)
    }
    return result as unknown as PrefectureKey
  }

  private formatRole(
    userRole: string,
    userDemarche: string | number,
    userDepartment: string | number,
    allDemarcheRecord: Record<string, number>,
  ): IRole {
    if (userRole === Roles.superadmin) {
      return { label: Roles.superadmin, options: {} }
    }
    if (![Roles.instructor, Roles.admin, 'instructeur'].includes(userRole)) {
      throw new Error(`this role ${userRole} doesn't exist`)
    }
    const role: IRole = {
      label: userRole === 'instructeur' ? Roles.instructor : userRole,
      options: {},
    }
    const roleOption: IRoleOption = {
      national: false,
      prefectures: [],
    }
    if (userDepartment === 'national') {
      roleOption.national = true
    } else if (typeof userDepartment === 'number') {
      roleOption.prefectures.push(this.formatDepartment(userDepartment))
    } else {
      roleOption.prefectures = userDepartment.split(';').map(d => this.formatDepartment(d))
    }
    const demarches = (typeof userDemarche === 'number')
      ? [userDemarche.toString()]
      : userDemarche.split(';').map(d => d.trim())
    const demarcheIds = Object.keys(allDemarcheRecord)
    for (const demarche of demarches) {
      if (!demarcheIds.includes(demarche)) {
        throw new Error(`Demarche with id ${demarche} does not exist.`)
      }
      role.options[allDemarcheRecord[demarche]] = roleOption
    }
    return role
  }

  private formatUser(user: ExcelUser, allDemarcheRecord: Record<string, number>): CreateUserDto {
    const prefecture = PrefectureDictionary['D' + user['Préfecture'].toString()]
    if (!prefecture) {
      throw new Error(`This prefecture doesn't exist: ${prefecture}`)
    }
    return {
      email: user.Email,
      lastname: user.Nom,
      firstname: user['Prénom'],
      job: user.Poste,
      prefecture,
      role: this.formatRole(user.Role, user['Liste des démarches'], user['Liste des départements'], allDemarcheRecord),
      password: 'user-imported-from-excel',
      validated: false,
    } as CreateUserDto
  }

  async createUserFromExcelData(users: ExcelUser[]): Promise<boolean> {
    const queryRunner = this.repo.manager.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    const allDemarcheRecord: Record<string, number> = Object.fromEntries(
      (await this.demarcheService.findMultipleDemarche({ select: ['id', 'dsDataJson'] }))
        .map(d => [d.dsDataJson.number.toString(), d.id]),
    )

    try {
      for (const excelUser of users) {
        const formatedUser = this.formatUser(excelUser, allDemarcheRecord)
        this.logger.debug(formatedUser)
        const user = this.repo.create(formatedUser)
        user.skipHashPassword = true
        await queryRunner.manager.save(user)
        this.logger.log('User imported: ' + user.email)
      }

      await queryRunner.commitTransaction()
      return true
    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.logger.warn(error)
      throw new BadRequestException(error)
    } finally {
      await queryRunner.release()
    }
  }
}
