import { Module } from '@nestjs/common'
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import configuration from '../../config/cron.config'
import loggerConfig from '../../config/logger.config'

import { LoggerModule } from '@/shared/modules/logger/logger.module'
import { typeormFactoryLoader } from '@/shared/utils/typeorm-factory-loader'
import redisConfig from '@/config/redis.config'
import { CustomBullModule } from '@/shared/modules/custom-bull/custom-bull.module'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { BullModule, BullModuleOptions } from '@nestjs/bull'
import bullConfig from '@/config/bull.config'
import dsConfig from '@/config/ds.config'
import { DsApiModule } from '@/shared/modules/ds-api/ds-api.module'
import fileConfig from '../../config/file.config'
import { S3Module } from '@/shared/modules/s3/s3.module'
import { FileProcessor } from '@/apps/worker-file/processor/file.processor'
import { FileModule } from '@/modules/files/file.module'
import { DossierModule } from '@/modules/dossiers/dossier.module'
import instructionTimeMappingConfig from '@/config/instructionTimeMapping.config'
import hubConfig from '../../config/hub.config'
import { WORKER_FILE_DEPENDENCY_POLICY } from '@/apps/worker-file/worker-file-dependencies-policy.const'
import { HealthModule } from '@/modules/health/health.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        configuration,
        dsConfig,
        loggerConfig,
        redisConfig,
        bullConfig,
        fileConfig,
        instructionTimeMappingConfig,
        hubConfig,
      ],
    } as ConfigModuleOptions),
    LoggerModule.forRoot('worker-file'),
    TypeOrmModule.forRootAsync(typeormFactoryLoader),
    CustomBullModule,
    BullModule.registerQueue(
      ...([
        { name: QueueName.sync },
        { name: QueueName.file },
      ] as BullModuleOptions[]),
    ),
    FileModule,
    DsApiModule,
    S3Module,
    DossierModule,
    HealthModule.register(WORKER_FILE_DEPENDENCY_POLICY),
  ],
  controllers: [
  ],
  providers: [
    FileProcessor,
  ],
})
export class WorkerFileModule {}
