import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt'

import { LoggerService } from '@/shared/modules/logger/logger.service'

@Catch(TokenExpiredError, JsonWebTokenError)
export class JWTExceptionFilter implements ExceptionFilter {
  constructor (
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  async catch (exception: TokenExpiredError | JsonWebTokenError, host: ArgumentsHost): Promise<void> {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    this.logger.warn(exception)
    // this.logger.debug(JSON.stringify(exception.response?.data))
    const res = ctx.getResponse()
    res.clearCookie('refreshToken')
    httpAdapter.reply(
      res,
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
