import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { LoggerService } from '../../modules/logger/logger.service'
import { TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt'

@Catch(TokenExpiredError, JsonWebTokenError)
export class JWTExceptionFilter implements ExceptionFilter {
  constructor (private readonly httpAdapterHost: HttpAdapterHost, private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name)
  }

  catch (exception: TokenExpiredError | JsonWebTokenError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    this.logger.error(exception)
    this.logger.debug(JSON.stringify(exception.response?.data))

    httpAdapter.reply(
      ctx.getResponse(),
      {
        statusCode: 401,
        message: 'Not authorized',
        data: {},
        path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
      },
      401,
    )
  }
}
