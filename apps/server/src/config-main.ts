import * as passport from 'passport'
import * as session from 'express-session'
import { sessionSecret } from './modules/auth/objects/constants'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from './shared/modules/logger/logger.service'
import { HttpAdapterHost } from '@nestjs/core'
import { QueryFailedFilter } from './shared/exceptions/filters/query-failed.filter'
import { AllExceptionsFilter } from './shared/exceptions/filters/all-exception.filter'
import { AxiosExceptionFilter } from './shared/exceptions/filters/axios-exception.filter'
import { CustomValidationPipe } from '@/shared/pipe/custom-validation.pipe'
import { CustomValidationExceptionFilter } from '@/shared/exceptions/filters/custom-validation-exception.filter'

export const configMain = async (app: INestApplication, configService?: ConfigService): Promise<void> => {
  const loggerService = await app.resolve<LoggerService>(LoggerService)
  configService = configService ?? app.get(ConfigService)
  loggerService.setContext('Nestjs-main')
  app.useLogger(loggerService)
  const httpAdapterHost = app.get(HttpAdapterHost)
  app.use(
    session({
      secret: sessionSecret.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: configService ? configService.get<number>('cookie.maxAge') : 3600000,
      },
    }),
  )
  let exceptionFilterLogger: LoggerService = loggerService
  let queryFailedFilterLogger: LoggerService = loggerService
  let axiosFailedErrorLogger: LoggerService = loggerService
  let customValidationErrorLogger: LoggerService = loggerService
  if (!configService.get('isTest')) {
    exceptionFilterLogger = new LoggerService(configService)
    exceptionFilterLogger.setContext('AllExceptionsFilter')
    queryFailedFilterLogger = new LoggerService(configService)
    queryFailedFilterLogger.setContext('QueryFailedFilter')
    axiosFailedErrorLogger = new LoggerService(configService)
    axiosFailedErrorLogger.setContext('AxiosExceptionFilter')
    customValidationErrorLogger = new LoggerService(configService)
    customValidationErrorLogger.setContext('CustomValidationExceptionFilter')
  }
  // order is important here, from most generic to most specific
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost, exceptionFilterLogger),
    new QueryFailedFilter(httpAdapterHost, queryFailedFilterLogger),
    new AxiosExceptionFilter(httpAdapterHost, axiosFailedErrorLogger),
    new CustomValidationExceptionFilter(httpAdapterHost, customValidationErrorLogger),
  )
  app.useGlobalPipes(new CustomValidationPipe())
  app.use(passport.initialize())
  app.use(passport.session())
}
