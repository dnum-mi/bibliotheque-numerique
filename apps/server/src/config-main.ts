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
import { APP_NAME_TOKEN } from '@/shared/modules/logger/logger.const'
import { LoggingInterceptor } from '@/shared/modules/logger/logging.interceptor'
import { EntityNotFoundErrorFilter } from '@/shared/exceptions/filters/entity-not-found-error.filter'
import * as cookieParser from 'cookie-parser'

export const configMain = async (app: INestApplication, configService?: ConfigService): Promise<void> => {
  const loggerService = await app.resolve<LoggerService>(LoggerService)
  const appNameToken = app.get(APP_NAME_TOKEN)
  configService = configService ?? app.get(ConfigService)
  loggerService.setContext('Nestjs-main')
  app.useLogger(loggerService)
  const httpAdapterHost = app.get(HttpAdapterHost)
  let exceptionFilterLogger: LoggerService = loggerService
  let queryFailedFilterLogger: LoggerService = loggerService
  let axiosFailedErrorLogger: LoggerService = loggerService
  let customValidationErrorLogger: LoggerService = loggerService
  let entityNotFoundErrorLogger: LoggerService = loggerService
  if (!configService.get('isTest')) {
    exceptionFilterLogger = new LoggerService(configService, appNameToken)
    exceptionFilterLogger.setContext('AllExceptionsFilter')
    queryFailedFilterLogger = new LoggerService(configService, appNameToken)
    queryFailedFilterLogger.setContext('QueryFailedFilter')
    axiosFailedErrorLogger = new LoggerService(configService, appNameToken)
    axiosFailedErrorLogger.setContext('AxiosExceptionFilter')
    customValidationErrorLogger = new LoggerService(configService, appNameToken)
    customValidationErrorLogger.setContext('CustomValidationExceptionFilter')
    entityNotFoundErrorLogger = new LoggerService(configService, appNameToken)
    entityNotFoundErrorLogger.setContext('EntityNotFoundErrorFilter')
  }
  // order is important here, from most generic to most specific
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost, exceptionFilterLogger),
    new QueryFailedFilter(httpAdapterHost, queryFailedFilterLogger),
    new AxiosExceptionFilter(httpAdapterHost, axiosFailedErrorLogger),
    new CustomValidationExceptionFilter(httpAdapterHost, customValidationErrorLogger),
    new EntityNotFoundErrorFilter(httpAdapterHost, entityNotFoundErrorLogger),
  )
  app.useGlobalPipes(new CustomValidationPipe())
  if (!configService.get('isTest') && !configService.get('isDev')) {
    const globalRequestLoggerService = new LoggerService(configService, appNameToken)
    globalRequestLoggerService.setContext('GlobalRequestInterceptor')
    app.useGlobalInterceptors(new LoggingInterceptor(globalRequestLoggerService))
  }
  app.use(passport.initialize())
  app.use(cookieParser())
}
