import { PUBLIC_ROUTE_KEY } from '@/modules/users/providers/decorators/public-route.decorator'
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { User } from '../../objects/user.entity'
import { Roles, userErroCodes } from '@biblio-num/shared'

@Injectable()
export class TermsOfUseGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly logger: Logger,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const publicRoute = this.reflector.get<boolean>(
      PUBLIC_ROUTE_KEY,
      context.getHandler(),
    )

    if (publicRoute) {
      return true
    }

    const request = context.switchToHttp().getRequest< Request & {
      user: User,
      url: string
    }>()
    const user = request.user

    const allowedPaths = ['/users/me', '/auth/logout', '/users/me/accept-terms']
    const isAllowedPaths = allowedPaths.some(path => request.url.includes(path))
    const isSudo = user.role?.label === Roles.sudo

    if (!user || isSudo || isAllowedPaths) {
      return true
    }

    if (!user.termsAcceptedAt) {
      this.logger.warn(`User ${user.email} blocked: CGU not accepted.`)
      throw new ForbiddenException({
        code: userErroCodes.CGU_NOT_ACCEPTED,
      })
    }

    return true
  }
}
