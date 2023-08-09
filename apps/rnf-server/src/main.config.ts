import { BadRequestException, INestApplication, ValidationError, ValidationPipe } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { AllExceptionsFilter } from '@/shared/filters/all-exception.filter'
import { HttpAdapterHost } from '@nestjs/core'

export function mainConfig (app: INestApplication) {
  const loggerService = app.get(LoggerService)
  const httpAdapterHost = app.get(HttpAdapterHost)

  app.useLogger(app.get(LoggerService))
  app.setGlobalPrefix('/api')
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const message = `Validation error(s):\n ${errors
          .map((e: ValidationError) => `Champs ${e.property}: ${Object.values(e.constraints!).join(', ')}`)
          .join('\n')}`
        return new BadRequestException(message)
      },
    }),
  )
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, loggerService))
}
