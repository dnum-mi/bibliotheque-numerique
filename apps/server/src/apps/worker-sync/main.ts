import { NestFactory } from '@nestjs/core'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { WorkerSyncModule } from './worker-sync.module'
import { ConfigService } from '@nestjs/config'
import { DependencySupervisorService } from '@/modules/health/providers/dependency-supervisor.service'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(WorkerSyncModule, {
    logger: ['warn', 'error', 'fatal'],
  })
  await app.init()
  app.useLogger(await app.resolve(LoggerService))
  const configService = app.get(ConfigService)
  const loggerService = await app.resolve(LoggerService)
  const supervisor = app.get(DependencySupervisorService)
  await supervisor.waitUntilReady()
  const port = configService.get('workerSyncPort')
  app.listen(port)
    .then(() => {
      loggerService.log(`🚀 WORKER SYNC started on ${port}`)
    })
}

bootstrap()
