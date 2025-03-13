import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { RolesKeys } from '@biblio-num/shared'
import { PUBLIC_ROUTE_KEY } from '@/modules/users/providers/decorators/public-route.decorator'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector, private readonly logger: Logger) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const publicRoute = this.reflector.get<RolesKeys>(PUBLIC_ROUTE_KEY, context.getHandler())
    if (publicRoute) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request & {
      cookies?: Record<string, string>, headers: Record<string, string> }>()

    if (!request.headers.authorization) {
      throw new UnauthorizedException('No access token found.')
    }

    try {
      await super.canActivate(context)
      return true
    } catch (error) {
      this.logger.error('Authentication failed', error)
      throw new UnauthorizedException('Invalid token or not authenticated.')
    }
  }
}
