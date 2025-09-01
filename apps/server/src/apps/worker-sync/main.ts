import { NestFactory } from '@nestjs/core'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { WorkerSyncModule } from './worker-sync.module'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerSyncModule)
  app.useLogger(await app.resolve(LoggerService))
}

bootstrap()
