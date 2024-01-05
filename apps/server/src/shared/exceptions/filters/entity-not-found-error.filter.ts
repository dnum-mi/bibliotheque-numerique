import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { LoggerService } from '../../modules/logger/logger.service'
import { EntityPropertyNotFoundError } from 'typeorm'

@Catch(EntityPropertyNotFoundError)
export class EntityNotFoundErrorFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  catch(exception: EntityPropertyNotFoundError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    this.logger.warn('400 BadRequest Exception: EntityPropertyNotFoundError')
    this.logger.warn(exception.message)

    httpAdapter.reply(
      ctx.getResponse(),
      {
        statusCode: 400,
        message: 'Validation failed',
        path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
      },
      400,
    )
  }
}
