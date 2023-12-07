import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import configuration from './config/worker.config'
import dsConfig from './config/ds.config'
import smtpConfig from './config/smtp.config'
import fileConfig from './config/file.config'
import loggerConfig from './config/logger.config'

import { LoggerModule } from './shared/modules/logger/logger.module'
import { CronModule } from './modules/cron/cron.module'
import { ScheduleModule } from '@nestjs/schedule'
import { typeormFactoryLoader } from './shared/utils/typeorm-factory-loader'
import { DsApiModule } from './shared/modules/ds-api/ds-api.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration, dsConfig, fileConfig, loggerConfig, smtpConfig],
    }),
    LoggerModule,
    TypeOrmModule.forRootAsync(typeormFactoryLoader),
    ScheduleModule.forRoot(),
    DsApiModule,
    CronModule,
  ],
  controllers: [],
  providers: [],
})
export class AppWorkerModule {}
