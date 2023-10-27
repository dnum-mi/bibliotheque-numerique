import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../../users/users.service'
import * as bcrypt from 'bcrypt'
import { User } from '../../users/entities/user.entity'
import { RoleOutputDto, UserOutputDto } from '@biblio-num/shared'

@Injectable()
export class AuthService {
  constructor (private usersService: UsersService) {}

  async validateUser (email: string, password: string): Promise<User | undefined> {
    const user: User = await this.usersService.findByEmail(email, ['id', 'email', 'password', 'roles', 'validated'])

    const unauthorizedError = new UnauthorizedException('Invalid credentials')
    if (!user || !user.validated) {
      throw unauthorizedError
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      throw unauthorizedError
    }

    return user
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async login (user): Promise<UserOutputDto> {
    const findUser: User = await this.usersService.findByEmail(user.email, ['id', 'email', 'roles'])
    return {
      id: findUser.id,
      email: findUser.email,
      roles: findUser.roles as unknown as RoleOutputDto[],
    }
  }
}
