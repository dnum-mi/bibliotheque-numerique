import { Module } from '@nestjs/common'
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule, BullModuleOptions } from '@nestjs/bull'

import configuration from '../../config/cron.config'
import loggerConfig from '../../config/logger.config'
import redisConfig from '@/config/redis.config'
import bullConfig from '@/config/bull.config'
import dsConfig from '@/config/ds.config'
import instructionTimeMappingConfig from '@/config/instructionTimeMapping.config'

import { LoggerModule } from '@/shared/modules/logger/logger.module'
import { typeormFactoryLoader } from '@/shared/utils/typeorm-factory-loader'
import { CustomBullModule } from '@/shared/modules/custom-bull/custom-bull.module'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { DsApiModule } from '@/shared/modules/ds-api/ds-api.module'

import { DemarcheProcessor } from '@/apps/worker-sync/processors/demarche.processor'
import { DossierProcessor } from '@/apps/worker-sync/processors/dossier.processor'

import { DossierModule } from '@/modules/dossiers/dossier.module'
import { DemarcheModule } from '@/modules/demarches/demarche.module'
import { InstructionTimeProcessor } from '@/apps/worker-sync/processors/instruction-time.processor'
import { InstructionTimesModule } from '@/modules/instruction_time/instruction_times.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        configuration,
        loggerConfig,
        redisConfig,
        dsConfig,
        instructionTimeMappingConfig,
        bullConfig,
      ],
    } as ConfigModuleOptions),
    LoggerModule.forRoot('worker-sync'),
    TypeOrmModule.forRootAsync(typeormFactoryLoader),
    CustomBullModule,
    DsApiModule,
    BullModule.registerQueue(
      ...([
        { name: QueueName.sync },
        { name: QueueName.file },
      ] as BullModuleOptions[]),
    ),
    DemarcheModule,
    DossierModule,
    InstructionTimesModule,
  ],
  controllers: [],
  providers: [
    DemarcheProcessor,
    DossierProcessor,
    InstructionTimeProcessor,
  ],
})
export class WorkerSyncModule {}
