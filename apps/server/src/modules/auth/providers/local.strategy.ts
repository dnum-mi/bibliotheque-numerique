import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { User } from '@/modules/users/objects/user.entity'
import { LoggerService } from '@/shared/modules/logger/logger.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor (private authService: AuthService, private logger: LoggerService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    })
  }

  async validate (email: string, password: string): Promise<User | undefined> {
    this.logger.verbose('validate')
    const user = await this.authService.validateUser(email, password)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
