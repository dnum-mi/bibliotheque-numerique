import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import configuration from "./config/worker.config";
import dsConfig from "./config/ds.config";
import { AppDataSource } from "./db/app-data-source";
import { LoggerModule } from "./logger/logger.module";
import fileConfig from "./config/file.config";
import { CronModule } from "./modules/cron/cron.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration, dsConfig, fileConfig],
    }),
    LoggerModule,
    //TODO: worker should not have same config as server. It should not be able to access all entity of application
    TypeOrmModule.forRoot(AppDataSource.options),

    ScheduleModule.forRoot(),
    CronModule,
  ],
  controllers: [],
  providers: [],
})
export class AppWorkerModule {}
