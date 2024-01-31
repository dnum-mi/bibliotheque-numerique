import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { WorkerFileModule } from './worker-file.module'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(WorkerFileModule)
  const configService = app.get(ConfigService)
  app.useLogger(await app.resolve(LoggerService))
  await app.listen(configService.get('port'))
}

bootstrap()
