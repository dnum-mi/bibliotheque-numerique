import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  Inject,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'

// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const Roles = (...roles: string[]) => SetMetadata('roles', roles)

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  // TODO: role refacto
  // eslint-disable-next-line
  canActivate(context: ExecutionContext): boolean {
    return true
  }
}
