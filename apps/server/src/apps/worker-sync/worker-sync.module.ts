import { Module } from '@nestjs/common'
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import configuration from '../../config/cron.config'
import loggerConfig from '../../config/logger.config'
import { LoggerModule } from '@/shared/modules/logger/logger.module'
import { typeormFactoryLoader } from '@/shared/utils/typeorm-factory-loader'
import redisConfig from '@/config/redis.config'
import { CustomBullModule } from '@/shared/modules/custom-bull/custom-bull.module'
import { FakeProcessor } from '@/apps/worker-sync/processors/fake.processor'
import { BullModule, BullModuleOptions } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration, loggerConfig, redisConfig],
    } as ConfigModuleOptions),
    LoggerModule.forRoot('worker-sync'),
    TypeOrmModule.forRootAsync(typeormFactoryLoader),
    CustomBullModule,
    BullModule.registerQueue(...[{ name: QueueName.sync }, { name: QueueName.file }] as BullModuleOptions[]),
  ],
  controllers: [],
  providers: [
    FakeProcessor,
  ],
})
export class WorkerSyncModule {}
