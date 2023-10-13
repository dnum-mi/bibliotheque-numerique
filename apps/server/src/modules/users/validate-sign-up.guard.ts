import { ValidateEmailDto } from '@biblio-num/shared'
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Observable } from 'rxjs'
import { UsersService } from './users.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'

@Injectable()
export class ValidSignUpGuard implements CanActivate {
  constructor (private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    protected logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  canActivate (context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    return this.validateRequest(request)
  }

  async validateRequest (request): Promise<boolean> {
    const body: ValidateEmailDto = request.body

    const { token } = body
    if (!token) throw new UnauthorizedException()
    // jwt does not go natively in url. We had to transform it in base64
    const tokenJwt = Buffer.from(token, 'base64url').toString()
    try {
      const decode = this.jwtService.verify(tokenJwt)
      if (!decode || typeof decode === 'string') return false
      const user = await this.userService.findOneOrThrow({ where: { email: decode.user } })
      if (!user) return false
      request.user = user
      return true
    } catch (error) {
      this.logger.error(error)
    }
    return false
  }
}
