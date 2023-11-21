import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { LoggerService } from '@/shared/modules/logger/logger.service'

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor(private logger: LoggerService) {
    super()
    this.logger.setContext(this.constructor.name)
  }

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean
    const request = context.switchToHttp().getRequest()

    await super.logIn(request)
    return result
  }
}
