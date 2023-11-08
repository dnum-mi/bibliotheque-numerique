import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { User } from '../objects/user.entity'
import { FindOneOptions, In, Repository } from 'typeorm'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { SendMailService } from '../../sendmail/sendmail.service'
import {
  CreateUserDto,
  PaginatedUserDto,
  PaginationUserDto,
  MyProfileOutputDto,
  AgGridUserDto,
  IRole, OrganismeTypeKeys,
  PaginatedDto,
} from '@biblio-num/shared'
import { UserFieldTypeHashConst } from '@/modules/users/objects/consts/user-field-type-hash.const'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'

type jwtPlaylod = {
  user: string | number
}

@Injectable()
export class UsersService
  extends BaseEntityService<User>
  implements OnApplicationBootstrap {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(User) protected readonly repo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sendMailService: SendMailService,
    private readonly demarcheService: DemarcheService,
  ) {
    super(repo, logger, UserFieldTypeHashConst)
    this.logger.setContext(this.constructor.name)
  }

  async onApplicationBootstrap(): Promise<void> {
    if (this.configService.get('sudo-user.forceUpsert')) {
      this._upsertDefaultSudoUser()
    } else {
      this.logger.log('Skipping upserting of default sudo user.')
    }
  }

  private async _upsertDefaultSudoUser(): Promise<void> {
    this.logger.verbose('_upsertDefaultSudoUser')
    await this.repo.upsert(
      {
        email: this.configService.get('sudo-user.email'),
        password: this.configService.get('sudo-user.hashedPassword'),
        validated: true,
        firstname: 'sudo',
        lastname: 'sudo',
        skipHashPassword: true,
        role: { label: 'sudo', options: [] },
      },
      { conflictPaths: ['email'] },
    )
  }

  async findByEmail(
    email: string,
    select?: FindOneOptions<User>['select'],
  ): Promise<User | undefined> {
    this.logger.verbose('findByEmail')
    return this.repo.findOne({
      where: { email: email.toLowerCase() },
      select,
    })
  }

  async create(body: CreateUserDto): Promise<User> {
    this.logger.verbose('create')
    const userInDb = await this.findByEmail(body.email)
    if (userInDb) {
      if (!userInDb.validated) {
        await this.mailToValidSignUp(userInDb)
      }
      throw new ConflictException({
        message: 'User already exists',
        data: { withEMailValidated: true },
      })
    }

    const user = await this.createAndSave(body)

    await this.mailToValidSignUp(user)

    return user
  }

  async findOrCreate(email: string, password): Promise<User> {
    this.logger.verbose('findOrCreate')
    const userInDb = await this.findByEmail(email)
    if (userInDb) {
      return userInDb
    }
    return this.createAndSave({
      email,
      password,
    })
  }

  async getUserById (id: number): Promise<User> {
    this.logger.verbose('getUserById')
    return this.findOneById(id).then((user) => {
      if (!user) {
        throw new NotFoundException('User not found')
      }
      return user
    })
  }

  async resetPassword(email: string): Promise<void> {
    this.logger.verbose('resetPassword')
    const userInDb = await this.repo.findOne({
      where: { email },
      select: ['id'],
    })
    if (!userInDb) {
      this.logger.warn(`Reset password: Cannot find user ${email}`)
      return
    }
    const { appUrl, jwtForUrl } = this.createJwtOnUrl({ user: userInDb.id })
    await this.sendMailService.resetPwd(
      email,
      `${appUrl}/update-password/${jwtForUrl}`,
    )
  }

  private createJwtOnUrl(playload: jwtPlaylod): {
    appUrl: string
    jwtForUrl: string
  } {
    const jwt = this.jwtService.sign(playload)
    // jwt does not go natively in url. We had to transform it in base64
    const jwtForUrl = Buffer.from(jwt).toString('base64url')
    const appUrl = this.configService.get('appFrontUrl')
    return { appUrl, jwtForUrl }
  }

  async updatePassword(user: User, password: string): Promise<void> {
    user.password = password
    await this.repo.save(user)
  }

  private async mailToValidSignUp(userInDb: User): Promise<void> {
    const { appUrl, jwtForUrl } = this.createJwtOnUrl({ user: userInDb.email })
    await this.sendMailService.validSignUp(
      userInDb.email,
      `${appUrl}/valid-email/${jwtForUrl}`,
    )
  }

  async validEmail(user: User): Promise<void> {
    if (user.validated) {
      this.logger.warn(`User ${user.email} already validated`)
      throw new ConflictException('User already validated')
    }
    await this.repo.update(user.id, { validated: true })
  }

  private _generateRoleResume(role: IRole, demarcheHash: Record<number, {types: OrganismeTypeKeys[]}>): string {
    this.logger.verbose('_generateRoleResume')
    const typeHash: Record<OrganismeTypeKeys, number> = {}
    Object.keys(role.options).forEach((demarcheId) => {
      demarcheHash[demarcheId].types.forEach((type) => {
        typeHash[type] = typeHash[type] ? typeHash[type] + 1 : 1
      })
    })
    return Object.entries(typeHash).map(([type, count]) => `${type} (${count})`).join(', ')
  }

  async listUsers (dto: PaginationUserDto): Promise<PaginatedUserDto> {
    this.logger.verbose('listUsers')
    const labelIndex = dto.columns.indexOf('roleLabel')
    const optionIndex = dto.columns.indexOf('roleOptionsResume')
    const userAskedForRole = labelIndex !== -1 || optionIndex !== -1
    if (userAskedForRole) {
      dto.columns.push('role')
      dto.columns = dto.columns.filter((c) => c !== 'roleLabel' && c !== 'roleOptionsResume')
    }
    const paginated: PaginatedDto<AgGridUserDto & { role: IRole}> = await this.paginate(dto)
    if (userAskedForRole) {
      const demarcheIds = paginated.data
        .map((user) => Object.keys(user.role?.options))
        .flat()
      const sds = await this.demarcheService.findMultipleDemarche({
        where: { id: In(demarcheIds) },
        select: ['id', 'types'],
      })
      const demarcheHash = Object.fromEntries(sds.map(sd => [sd.id, sd]))
      const users = paginated.data.map((user) => {
        user.roleLabel = user.role.label
        user.roleOptionsResume = this._generateRoleResume(user.role, demarcheHash)
        delete user.role
        return user
      })
      return {
        total: paginated.total,
        data: users,
      }
    }
    return paginated
  }

  async enrichProfileWithDemarche(user: User): Promise<MyProfileOutputDto> {
    const demarcheIds = Object.keys(user.role.options)
    const smallDemarches = await this.demarcheService.findMultipleSmallDemarche(
      { where: { id: In(demarcheIds) } },
      user.role,
    )
    const sdHash = Object.fromEntries(smallDemarches.map((sd) => [sd.id, sd]))
    delete user.skipHashPassword
    delete user.password
    return {
      ...user,
      role: {
        ...user.role,
        options: Object.fromEntries(
          Object.entries(user.role.options).map(([id, option]) => [
            id,
            { ...option, demarche: sdHash[id] },
          ]),
        ),
      },
    }
  }
}
