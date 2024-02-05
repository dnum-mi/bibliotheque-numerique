import { NestFactory } from '@nestjs/core'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { WorkerFileModule } from './worker-file.module'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerFileModule)
  app.useLogger(await app.resolve(LoggerService))
}

bootstrap()
