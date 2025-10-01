import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { User } from '../objects/user.entity'
import { FindOneOptions, In, Not, Repository } from 'typeorm'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { SendMailService } from '../../sendmail/sendmail.service'

import {
  Roles,
  IRole,
  OrganismeTypeKey,
  IUser,
  PasswordRequestsDecisionKey,
  ePasswordRequestsDecision,
} from '@biblio-num/shared'

import { UserFieldTypeHashConst } from '@/modules/users/objects/consts/user-field-type-hash.const'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import {
  CreateUserDto,
  PaginationUserDto,
} from '@/modules/users/objects/dtos/input'
import {
  AgGridUserDto,
  MyProfileOutputDto,
  PaginatedUserDto,
} from '@/modules/users/objects/dtos/output'
import { PaginatedDto } from '@/shared/pagination/paginated.dto'
import { RefreshToken } from '../../auth/objects/refresh-token.entity'
import { durationToString } from '@/shared/utils/bn-code.utils'
import { RequestPasswordInputDto } from '../objects/dtos/input/request-password-input.dto'
import { PasswordChangeRequestsDto } from '../objects/dtos/output/password-change-requests.dto'

type jwtPlaylod = {
  user: string | number
}

@Injectable()
export class UserService
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
        role: { label: 'sudo', options: {} },
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

  async create(dto: CreateUserDto): Promise<User> {
    this.logger.verbose('create')
    const userInDb = await this.findByEmail(
      dto.email,
      ['id', 'email', 'firstname', 'lastname', 'password', 'validated'], // override select to have password
    )
    if (userInDb) {
      if (userInDb.password === 'user-imported-from-excel') {
        userInDb.password = dto.password
        await userInDb.hashPassword()
        delete dto.password
        await this.repo.update(
          {
            email: dto.email,
          },
          { ...userInDb, ...dto },
        )
        delete userInDb.password
      }
      if (!userInDb.validated) {
        await this.mailToValidSignUp(userInDb)
      } else {
        await this.mailToAlreadySignUp(userInDb)
      }

      return userInDb
    }

    const user = await this.createAndSave(dto)

    await this.mailToValidSignUp(user)

    return user
  }

  async updateLoginAttempts(userId: number, attempts: number): Promise<void> {
    await this.repo.update(userId, { loginAttempts: attempts })
  }

  async getUserById(id: number): Promise<User> {
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
    const { appUrl, jwtForUrl, duration } = this.createJwtOnUrl({
      user: userInDb.id,
    })
    await this.sendMailService.resetPwd(
      email,
      userInDb.firstname,
      userInDb.lastname,
      `${appUrl}/update-password/${jwtForUrl}`,
      duration,
    )
  }

  async requestManualResetPassword({
    email,
    password,
  }: RequestPasswordInputDto): Promise<void> {
    this.logger.verbose('requestManualResetPassword')
    const user = await this.repo.findOne({
      where: { email },
    })

    if (!user) {
      this.logger.warn(`Cannot find user ${email}`)
      return
    }

    user.pendingPasswordHash = await User.hash(password)
    user.passwordChangeRequested = true
    user.passwordChangeRequestedAt = new Date()
    user.skipHashPassword = true

    await this.repo.save(user)
    await this.deleteUserRefreshTokens(user.id)
  }

  async listPasswordChangeRequests(): Promise<PasswordChangeRequestsDto[]> {
    this.logger.verbose('listPasswordChangeRequests')
    return await this.repo.find({
      where: { passwordChangeRequested: true },
      select: [
        'id',
        'firstname',
        'lastname',
        'email',
        'prefecture',
        'passwordChangeRequestedAt',
      ],
      order: {
        passwordChangeRequestedAt: 'ASC',
      },
    })
  }

  async managePasswordRequest(
    userId: number,
    action: PasswordRequestsDecisionKey,
  ): Promise<void> {
    const user = await this.repo.findOne({
      where: { id: userId },
      select: [
        'id',
        'firstname',
        'lastname',
        'email',
        'pendingPasswordHash',
        'passwordChangeRequested',
      ],
    })
    if (!user) {
      this.logger.warn(`Cannot find user with ID ${userId}`)
      throw new NotFoundException(`User with ID ${userId} not found.`)
    }

    if (!user.passwordChangeRequested) {
      this.logger.warn(`This user with ID ${userId} does not have pending password change request.`)
      throw new BadRequestException(
        'This user does not have pending password change request.',
      )
    }

    if (action === ePasswordRequestsDecision.APPROVE) {
      user.password = user.pendingPasswordHash
      user.validated = true
      user.skipHashPassword = true
    }

    user.pendingPasswordHash = null
    user.passwordChangeRequested = false
    user.passwordChangeRequestedAt = null
    user.skipHashPassword = true

    await this.repo.save(user)
    await this.mailToPasswordRequestDecision(user, action)
  }

  private async mailToPasswordRequestDecision (user: User, action: PasswordRequestsDecisionKey): Promise<void> {
    const appUrl = this.configService.get('appFrontUrl')

    if (action === ePasswordRequestsDecision.APPROVE) {
      await this.sendMailService.approvePasswordResetRequest(
        user.email,
        user.firstname,
        user.lastname,
        `${appUrl}/sign_in`,
      )
    } else {
      await this.sendMailService.rejectPasswordResetRequest(
        user.email,
        user.firstname,
        user.lastname,
      )
    }
  }

  public createJwtOnUrl(playload: jwtPlaylod): {
    appUrl: string
    jwtForUrl: string
    duration: string
  } {
    const jwt = this.jwtService.sign(playload)
    // jwt does not go natively in url. We had to transform it in base64
    const jwtForUrl = Buffer.from(jwt).toString('base64url')
    const appUrl = this.configService.get('appFrontUrl')
    const duration = durationToString(this.configService.get('jwt').expiresIn)
    return { appUrl, jwtForUrl, duration }
  }

  public async deleteUserRefreshTokens(userId: number): Promise<void> {
    await this.repo.manager
      .getRepository(RefreshToken)
      .delete({ user: { id: userId } })
  }

  async updatePassword(user: User, password: string): Promise<void> {
    user.password = password
    user.validated = true // changing password via mail = verifying mail
    await this.repo.save(user)
    await this.deleteUserRefreshTokens(user.id)
    await this.updateLoginAttempts(user.id, 0)
  }

  private async mailToValidSignUp(userInDb: User): Promise<void> {
    const { appUrl, jwtForUrl, duration } = this.createJwtOnUrl({
      user: userInDb.email,
    })
    await this.sendMailService.validSignUp(
      userInDb.email,
      userInDb.firstname,
      userInDb.lastname,
      `${appUrl}/valid-email/${jwtForUrl}`,
      duration,
    )
  }

  private async mailToAlreadySignUp(userInDb: User): Promise<void> {
    const { appUrl, jwtForUrl, duration } = this.createJwtOnUrl({
      user: userInDb.id,
    })
    await this.sendMailService.alreadySignUp(
      userInDb.email,
      userInDb.firstname,
      userInDb.lastname,
      `${appUrl}/update-password/${jwtForUrl}`,
      duration,
    )
  }

  async validEmail(user: User): Promise<void> {
    if (user.validated) {
      this.logger.warn(`User ${user.email} already validated`)
      throw new ConflictException('User already validated')
    }
    await this.repo.update(user.id, { validated: true })
  }

  private _generateRoleResume(
    role: IRole,
    demarcheHash: Record<number, { types: OrganismeTypeKey[] }>,
  ): string {
    this.logger.verbose('_generateRoleResume')
    const typeHash: Partial<Record<OrganismeTypeKey, number>> = {}
    Object.keys(role.options).forEach((demarcheId) => {
      demarcheHash[demarcheId]?.types.forEach((type) => {
        typeHash[type] = typeHash[type] ? typeHash[type] + 1 : 1
      })
    })
    return Object.entries(typeHash)
      .map(([type, count]) => `${type} (${count})`)
      .join(', ')
  }

  async listUsers(
    dto: PaginationUserDto,
    currentUser: IUser,
  ): Promise<PaginatedUserDto> {
    this.logger.verbose('listUsers')
    const labelIndex = dto.columns.indexOf('roleLabel')
    const optionIndex = dto.columns.indexOf('roleOptionsResume')
    const userAskedForRole = labelIndex !== -1 || optionIndex !== -1
    if (userAskedForRole) {
      dto.columns.push('role')
      dto.columns = dto.columns.filter(
        (c) => c !== 'roleLabel' && c !== 'roleOptionsResume',
      )
    }
    const specificConditions = {
      id: Not(currentUser.id),
    }
    const paginated: PaginatedDto<
      AgGridUserDto & {
        role: IRole
      }
    > = await this.paginate(dto, specificConditions, [
      // ⚠️ "o" correspond to the alias o in pagination function.
      `("o".role ->> 'label' != '${Roles.sudo}' OR "o".role ->> 'label' IS NULL)`,
    ])
    if (userAskedForRole) {
      const demarcheIds = paginated.data
        .map((user) => Object.keys(user.role?.options))
        .flat()
      const sds = await this.demarcheService.findMultipleDemarche({
        where: { id: In(demarcheIds) },
        select: ['id', 'types'],
      })
      const demarcheHash = Object.fromEntries(sds.map((sd) => [sd.id, sd]))
      const users = paginated.data.map((user) => {
        user.roleLabel = user.role.label
        user.roleOptionsResume = this._generateRoleResume(
          user.role,
          demarcheHash,
        )
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

  async profile(user: User): Promise<MyProfileOutputDto> {
    const foundUser = await this.findOneOrThrow({ where: { id: user.id } })
    return this.enrichProfileWithDemarche(foundUser)
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
          Object.entries(user.role.options)
            .filter(([id]) => sdHash[id])
            .map(([id, option]) => [id, { ...option, demarche: sdHash[id] }]),
        ),
      },
    }
  }
}
