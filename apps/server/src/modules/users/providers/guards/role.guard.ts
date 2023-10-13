import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLE_KEY } from '../decorators/role.decorator'
import { RolesKeys } from '@biblio-num/shared'
import { isSuperiorOrSimilar } from '@/modules/users/utils/role.utils'
import { PUBLIC_ROUTE_KEY } from '@/modules/users/providers/decorators/public-route.decorator'
import { LoggerService } from '@/shared/modules/logger/logger.service'

const noRoleDefined = (context: ExecutionContext): void => {
  const handler = context.getHandler()
  const functionName = handler.name

  const controllerClass = context.getClass()
  const controllerName = controllerClass.name
  throw new Error(`
          Controller: ${controllerName},
          Function: ${functionName},
          => This route has no role attach to it.
          It's a security breach.
          Please attach a role to your newly created route
        `)
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private logger: LoggerService) {
    this.logger.setContext(this.constructor.name)
  }

  canActivate(context: ExecutionContext): boolean {
    this.logger.verbose('canActivate')
    const publicRoute = this.reflector.get<RolesKeys>(PUBLIC_ROUTE_KEY, context.getHandler())
    if (publicRoute) {
      this.logger.debug('it\'s a publicRoute')
      return true
    }

    const endPointRole = this.reflector.get<RolesKeys>(ROLE_KEY, context.getHandler())
    if (!endPointRole) {
      noRoleDefined(context)
    }

    const user = context.switchToHttp().getRequest().user
    if (!user) {
      throw new UnauthorizedException('You are not connected.')
    }
    this.logger.debug(`Hi ${user.email}`)
    const userRole = user.role?.label
    if (!userRole && endPointRole === 'any') { // anyone connected
      return true
    } else if (isSuperiorOrSimilar(endPointRole, userRole)) {
      return true
    } else {
      this.logger.warn(`User with role ${userRole} cannot access to route which has a minimum role of ${endPointRole}.`)
      return false
    }
  }
}
