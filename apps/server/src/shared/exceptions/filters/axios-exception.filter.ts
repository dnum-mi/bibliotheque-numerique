import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { LoggerService } from '../../modules/logger/logger.service'
import { AxiosError } from 'axios'

@Catch(AxiosError)
export class AxiosExceptionFilter implements ExceptionFilter {
  constructor (private readonly httpAdapterHost: HttpAdapterHost, private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name)
  }

  catch (exception: AxiosError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    this.logger.error(exception)
    this.logger.debug(JSON.stringify(exception.response?.data))
    httpAdapter.reply(
      ctx.getResponse(),
      {
        statusCode: 424,
        message: 'External dependency error',
        data: {},
        path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
      },
      424,
    )
  }
}
