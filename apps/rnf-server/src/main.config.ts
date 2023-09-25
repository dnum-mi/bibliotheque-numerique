import { BadRequestException, INestApplication, ValidationError, ValidationPipe } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { AllExceptionsFilter } from '@/shared/filters/all-exception.filter'
import { HttpAdapterHost } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'

export async function mainConfig (app: INestApplication, isTest = false) {
  const loggerService = await app.resolve<LoggerService>(LoggerService)
  loggerService.setContext('Nestjs-main')
  const httpAdapterHost = app.get(HttpAdapterHost)

  app.useLogger(loggerService)
  app.setGlobalPrefix('/api')
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const message = `Validation error(s):\n ${errors
          .map((e: ValidationError) => `Champ ${e.property}: ${Object.values(e.constraints!).join(', ')}`)
          .join('\n')}`
        return new BadRequestException(message)
      },
    }),
  )
  const allExceptionsFilterLogger = new LoggerService(app.get(ConfigService))
  allExceptionsFilterLogger.setContext('AllExceptionsFilter')
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, isTest ? loggerService : allExceptionsFilterLogger))
}
