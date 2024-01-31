import { Module } from '@nestjs/common'
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import configuration from '../../config/worker.config'
import loggerConfig from '../../config/logger.config'

import { LoggerModule } from '@/shared/modules/logger/logger.module'
import { typeormFactoryLoader } from '@/shared/utils/typeorm-factory-loader'
import redisConfig from '@/config/redis.config'
import { BullModule } from '@nestjs/bull'
import bullModuleFactoryLoader from '@/shared/queue-common/bull-module-factory-loader'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        configuration,
        loggerConfig,
        redisConfig,
      ],
    } as ConfigModuleOptions),
    BullModule.forRootAsync(bullModuleFactoryLoader),
    LoggerModule.forRoot('worker-sync'),
    TypeOrmModule.forRootAsync(typeormFactoryLoader),
  ],
  controllers: [],
  providers: [],
})
export class WorkerFileModule {}
