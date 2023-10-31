import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { DsApiError } from '@dnum-mi/ds-api-client'
import { LoggerService } from '../../modules/logger/logger.service'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor (private readonly httpAdapterHost: HttpAdapterHost, private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name)
  }

  catch (exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()

    let httpStatus: HttpStatus =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'no message.'
    const data = {}

    switch (true) {
    case !exception:
      this.logger.error(new Error('AllException filter caught something that is not defined'))
      break
    case exception instanceof DsApiError:
      this.logger.warn((exception as DsApiError).message)
      httpStatus = 424
      message = (exception as DsApiError).message
      this.logger.debug((exception as DsApiError).graphQlResponse as string)
      break
    case exception instanceof HttpException && httpStatus !== HttpStatus.INTERNAL_SERVER_ERROR:
      message = (exception as HttpException).message
      this.logger.warn(exception as HttpException)
      break
    default:
      message = 'Erreur serveur, l’administrateur a été prévenu'
      this.logger.error((exception as Error).message)
      this.logger.debug((exception as Error).stack)
    }

    const responseBody = {
      statusCode: httpStatus,
      message,
      data,
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}
