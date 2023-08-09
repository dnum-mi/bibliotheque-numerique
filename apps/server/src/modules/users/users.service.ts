import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { User } from './entities/user.entity'
import { FindOneOptions, Repository } from 'typeorm'
import { BaseEntityService } from '../../shared/base-entity/base-entity.service'
import { LoggerService } from '../../shared/modules/logger/logger.service'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { SendMailService } from '../sendmail/sendmail.service'

@Injectable()
export class UsersService extends BaseEntityService<User> {
  constructor (
    protected logger: LoggerService,
    @InjectRepository(User) protected readonly repo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sendMailService: SendMailService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  async findByEmail (email: string, select?: FindOneOptions<User>['select']): Promise<User | undefined> {
    this.logger.verbose('findByEmail')
    return this.repo.findOne({
      where: { email },
      relations: { roles: true },
      select,
    })
  }

  async create (email: string, password): Promise<User> {
    this.logger.verbose('create')
    const userInDb = await this.findByEmail(email)
    if (userInDb) {
      throw new ConflictException('User already exists')
    }
    return this.createAndSave({
      email,
      password,
    })
  }

  async findOrCreate (email: string, password): Promise<User> {
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

  async listUsers (): Promise<User[]> {
    this.logger.verbose('listUsers')
    return await this.repo.find({ relations: ['roles'] })
  }

  async getUserById (id: number): Promise<User> {
    this.logger.verbose('getUserById')
    return this.findOneById(id, { roles: true }).then((user) => {
      if (!user) {
        throw new NotFoundException('User not found')
      }
      return user
    })
  }

  async resetPassword (email: string): Promise<void> {
    this.logger.verbose('resetPassword')
    const userInDb = await this.repo.findOne({
      where: { email },
      select: ['id'],
    })
    if (!userInDb) {
      this.logger.warn(`Reset password: Cannot find user ${email}`)
      return
    }
    const jwt = this.jwtService.sign({ user: userInDb.id })
    // jwt does not go natively in url. We had to transform it in base64
    const jwtForUrl = Buffer.from(jwt).toString('base64url')
    const appUrl = this.configService.get('appFrontUrl')
    await this.sendMailService.resetPwd(email, `${appUrl}/update-password/${jwtForUrl}`)
  }

  async updatePassword (user: User, password: string): Promise<void> {
    user.password = password
    await this.repo.save(user)
  }
}
