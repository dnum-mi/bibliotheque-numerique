import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { LoggerService } from '../../modules/logger/logger.service'
import { CustomValidationException } from '@/shared/exceptions/custom-validation.exception'

@Catch(CustomValidationException)
export class CustomValidationExceptionFilter implements ExceptionFilter {
  constructor (private readonly httpAdapterHost: HttpAdapterHost, private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name)
  }

  catch (exception: CustomValidationException, host: ArgumentsHost): void {
    this.logger.verbose('catch')
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    this.logger.warn('400 BadRequest Exception: Validation failed')
    this.logger.debug(exception.validationErrors)

    httpAdapter.reply(
      ctx.getResponse(),
      {
        statusCode: 400,
        message: 'Validation failed',
        data: {
          errors: exception.validationErrors,
        },
        path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
      },
      400,
    )
  }
}
