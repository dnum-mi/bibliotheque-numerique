import { BadRequestException, Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { User } from '@/modules/users/objects/user.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { IRole, IRoleOption, PrefectureDictionary, PrefectureKey, Roles } from '@biblio-num/shared'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import { ExcelUser } from '@/modules/users/objects/types/excel-user.type'
import { RefreshToken } from '@/modules/auth/objects/refresh-token.entity'

@Injectable()
export class UserImportService {
  constructor(
    private readonly logger: LoggerService,
    @InjectRepository(User) protected readonly repo: Repository<User>,
    private readonly demarcheService: DemarcheService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private formatWithPrefectureKey(department: string | number): string {
    let result: string
    if (typeof department === 'string') {
      const d: string = department.trim()
      result = 'D' + (d.length === 1 ? '0' + d : d)
    } else if (typeof department === 'number') {
      result = 'D' + (department < 10 ? '0' + department : department.toString())
    }
    return result
  }

  private formatDepartment(department: string | number): PrefectureKey {
    const departmentKey = this.formatWithPrefectureKey(department)
    if (!PrefectureDictionary[departmentKey]) {
      throw new Error(`Department key ${departmentKey} does not exist`)
    }
    return departmentKey as unknown as PrefectureKey
  }

  private formatPrefecture(prefecture: string | number): PrefectureKey {
    const prefectureKey = this.formatWithPrefectureKey(prefecture)
    if (!PrefectureDictionary[prefectureKey]) {
      throw new Error(`Prefecture key ${prefectureKey} does not exist`)
    }
    return prefectureKey as unknown as PrefectureKey
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

  private formatUser(user: ExcelUser, allDemarcheRecord: Record<string, number>): User {
    const prefecture =
      PrefectureDictionary[
        this.formatPrefecture(user['Préfecture'].toString())
      ]
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
    } as User
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
      const emails = users.map(user => user.Email)
      const uniqueEmails = new Set(emails)
      if (emails.length !== uniqueEmails.size) {
        throw new BadRequestException('Duplicate emails found in the excel data.')
      }
      for (const excelUser of users) {
        const formatedUser = this.formatUser(excelUser, allDemarcheRecord)
        this.logger.debug('formatedUser: ' + formatedUser)
        const existingUser = await this.repo.findOne({ where: { email: formatedUser.email }, select: ['id'] })
        this.logger.debug('existingUser: ' + existingUser)
        if (existingUser && existingUser.role?.label === Roles.sudo) {
          continue
        }
        if (existingUser) {
          await queryRunner.manager.update(User, { email: formatedUser.email }, {
            role: formatedUser.role,
          })
          await queryRunner.manager.delete(RefreshToken, { user: existingUser.id })
        } else {
          const user = this.repo.create(formatedUser)
          user.skipHashPassword = true
          this.logger.log('Create user: ' + JSON.stringify(user))
          await queryRunner.manager.save(user)
          this.logger.log('User imported: ' + user.email)
        }
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
