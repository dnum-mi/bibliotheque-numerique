import { Injectable, NotFoundException } from '@nestjs/common'
import { UsersService } from '../../users/providers/users.service'
import * as bcrypt from 'bcrypt'
import { User } from '../../users/entities/user.entity'
import { CredentialsInputDto, UserOutputDto } from '@biblio-num/shared'
import { LoggerService } from '@/shared/modules/logger/logger.service'

@Injectable()
export class AuthService {
  constructor (private usersService: UsersService, private logger: LoggerService) {}

  async validateUser (email: string, password: string): Promise<User | undefined> {
    this.logger.verbose('validateUser')
    const user: User = await this.usersService.findByEmail(email, ['id', 'email', 'password', 'validated', 'role'])
    if (!user) {
      throw new NotFoundException('User not found')
    }
    if (!user.validated) {
      throw new NotFoundException('Invalid e-mail')
    }
    const isMatch: boolean = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new NotFoundException('Invalid credentials')
    }
    this.logger.debug('User connected')
    this.logger.debug(user)
    return user
  }

  async login (dto: CredentialsInputDto): Promise<UserOutputDto> {
    this.logger.verbose(`login (${dto.email})`)
    const findUser: User = await this.usersService.findByEmail(dto.email, ['id', 'email'])
    // eslint-disable-next-line
    // @ts-ignore TODO: role refacto
    return {
      id: findUser.id,
      email: findUser.email,
    }
  }
}
