import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '../../shared/modules/logger/logger.service'
import { AppWorkerModule } from './worker-sync.module'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AppWorkerModule)
  const configService = app.get(ConfigService)
  app.useLogger(await app.resolve(LoggerService))
  await app.listen(configService.get('port'))
}

bootstrap()
