import { Module } from '@nestjs/common'
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import configuration from '../../config/worker.config'
import loggerConfig from '../../config/logger.config'

import { LoggerModule } from '@/shared/modules/logger/logger.module'
import { typeormFactoryLoader } from '@/shared/utils/typeorm-factory-loader'
import redisConfig from '@/config/redis.config'
import { CustomBullModule } from '@/shared/modules/custom-bull/custom-bull.module'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.const'
import { BullModule, BullModuleOptions } from '@nestjs/bull'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration, loggerConfig, redisConfig],
    } as ConfigModuleOptions),
    LoggerModule.forRoot('worker-file'),
    TypeOrmModule.forRootAsync(typeormFactoryLoader),
    CustomBullModule,
    BullModule.registerQueue({ name: QueueName.sync } as BullModuleOptions),
  ],
  controllers: [],
  providers: [],
})
export class WorkerFileModule {}
