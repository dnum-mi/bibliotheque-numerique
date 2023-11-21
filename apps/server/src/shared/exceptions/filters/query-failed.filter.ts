import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { LoggerService } from '../../modules/logger/logger.service'
import { QueryFailedError } from 'typeorm'

const knownConstraints = {
  UQ_CUSTOM_FILTERS: 'Vous avez déjà créé un filtre avec ce nom',
}

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    let statusCode = 500
    let message = 'Erreur serveur, l’administrateur a été prévenu.'

    if (
      exception.message &&
      exception.message.includes(
        'duplicate key value violates unique constraint',
      )
    ) {
      statusCode = 409
      const constraint = (exception as unknown as Record<string, string>).constraint
      message = constraint in knownConstraints ? knownConstraints[constraint] : 'Conflit : Cette valeur existe déjà.'
      this.logger.warn(`409 Conflict: ${exception.message}`)
    } else if (
      exception.message &&
      exception.message.match(/column o\.(.*) does not exist/)
    ) {
      statusCode = 400
      message = 'Conflict: This column cannot be selected.'
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
