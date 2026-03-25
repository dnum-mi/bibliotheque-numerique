import * as passport from 'passport'
import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from './shared/modules/logger/logger.service'
import { HttpAdapterHost } from '@nestjs/core'
import { QueryFailedFilter } from './shared/exceptions/filters/query-failed.filter'
import { AllExceptionsFilter } from './shared/exceptions/filters/all-exception.filter'
import { AxiosExceptionFilter } from './shared/exceptions/filters/axios-exception.filter'
import { CustomValidationPipe } from '@/shared/pipe/custom-validation.pipe'
import { CustomValidationExceptionFilter } from '@/shared/exceptions/filters/custom-validation-exception.filter'
import { LoggingInterceptor } from '@/shared/modules/logger/logging.interceptor'
import { EntityNotFoundErrorFilter } from '@/shared/exceptions/filters/entity-not-found-error.filter'
import * as cookieParser from 'cookie-parser'
import { JWTExceptionFilter } from './shared/exceptions/filters/jwt-exception.filter'
import { EventEmitter } from 'events'
import { ALS_INSTANCE } from '@/shared/modules/als/als.module'

export const configMain = async (
  app: INestApplication,
  configService?: ConfigService,
): Promise<void> => {
  configService = configService ?? app.get(ConfigService)
  const httpAdapterHost = app.get(HttpAdapterHost)

  const logger = await app.resolve(LoggerService)
  logger.setContext('Nestjs-main')
  app.useLogger(logger)

  const child = (ctx: string): LoggerService => logger.createChild(ctx)

  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost, child('AllExceptionsFilter')),
    new QueryFailedFilter(httpAdapterHost, child('QueryFailedFilter')),
    new AxiosExceptionFilter(httpAdapterHost, child('AxiosExceptionFilter')),
    new JWTExceptionFilter(httpAdapterHost, child('JWTExceptionFilter')),
    new CustomValidationExceptionFilter(httpAdapterHost, child('CustomValidationExceptionFilter')),
    new EntityNotFoundErrorFilter(httpAdapterHost, child('EntityNotFoundErrorFilter')),
  )

  app.useGlobalPipes(new CustomValidationPipe())

  if (configService.get('isProd')) {
    const asyncLocalStorage = app.get(ALS_INSTANCE)

    app.useGlobalInterceptors(
      new LoggingInterceptor(child('LoggingInterceptor'), asyncLocalStorage),
    )
  }

  app.use(passport.initialize())
  app.use(cookieParser())

  logger.debug(`
      ⚙️ == Runtime environment == ⚙️
      rawNodeEnv: ${process.env.NODE_ENV}
      runEnv: ${configService.get('runEnv')}
      env: ${configService.get('env')}
      isDev: ${configService.get('isDev')}
      isTest: ${configService.get('isTest')}
      isProd: ${configService.get('isProd')}
  `)

  EventEmitter.defaultMaxListeners = 20
}
