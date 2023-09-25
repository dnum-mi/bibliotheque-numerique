import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class PasswordGuard implements CanActivate {
  constructor(private readonly logger: LoggerService, private readonly config: ConfigService) {
    this.logger.setContext(this.constructor.name)
  }

  canActivate(context: ExecutionContext): boolean {
    this.logger.verbose('canActivate')
    const request = context.switchToHttp().getRequest()
    const tokenInHeader = (request as Request).headers['x-admin-token']

    if (tokenInHeader !== this.config.get('ds.adminToken')) {
      throw new ForbiddenException('Mot de passe incorrect.')
    }
    return true
  }
}
