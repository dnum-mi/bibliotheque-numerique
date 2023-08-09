import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import configuration from './config/worker.config'
import dsConfig from './config/ds.config'
import { LoggerModule } from './shared/modules/logger/logger.module'
import fileConfig from './config/file.config'
import { CronModule } from './modules/cron/cron.module'
import { ScheduleModule } from '@nestjs/schedule'
import { JobLogModule } from './modules/job-log/job-log.module'
import { typeormFactoryLoader } from './shared/utils/typeorm-factory-loader'
import loggerConfig from './config/logger.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration, dsConfig, fileConfig, loggerConfig],
    }),
    LoggerModule,
    TypeOrmModule.forRootAsync(typeormFactoryLoader),

    ScheduleModule.forRoot(),
    CronModule,
    JobLogModule,
  ],
  controllers: [],
  providers: [],
})
export class AppWorkerModule {}
