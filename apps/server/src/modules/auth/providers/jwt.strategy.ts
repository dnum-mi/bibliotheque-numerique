import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { UserService } from '../../users/providers/user.service'
import { User } from '@/modules/users/objects/user.entity'

interface JwtPayload {
  email: string;
  role: string;
  id: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService, private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('auth').jwtSecret,
    })
  }

  async validate(payload: JwtPayload): Promise<User | undefined> {
    const user = await this.userService.findByEmail(payload.email)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
