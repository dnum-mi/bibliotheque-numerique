import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { LoggerService } from '../../modules/logger/logger.service'
import { QueryFailedError } from 'typeorm'

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
  constructor (private readonly httpAdapterHost: HttpAdapterHost, private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name)
  }

  catch (exception: QueryFailedError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    let statusCode = 500
    let message = 'Internal server error.'

    if (exception.message && exception.message.includes('duplicate key value violates unique constraint')) {
      statusCode = 409
      message = 'Conflict: Duplicate entry found.'
      this.logger.warn(`409 Conflict: ${exception.message}`)
    } else {
      this.logger.error(`500 Typeorm QueryFailedError: ${exception.message}`)
    }
    this.logger.debug(exception.query)
    httpAdapter.reply(
      ctx.getResponse(),
      {
        statusCode,
        message,
        data: {},
        path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
      },
      statusCode,
    )
  }
}
