import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

// Load Configurations
import configuration from "./config/worker.config";
import dsConfig from "./config/ds.config";
import { AppDataSource } from "./db/app-data-source";

// Load Modules
import { LoggerModule } from "./logger/logger.module";
import fileConfig from "./config/file.config";
import { CronModule } from "./modules/cron/cron.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    // common module for all server and workers
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration, dsConfig, fileConfig],
    }),
    LoggerModule,
    //TODO: worker should not have same config as server. It should not be able to access all entity of application
    TypeOrmModule.forRoot(AppDataSource.options),

    // exclusif to worker module
    ScheduleModule.forRoot(),
    CronModule,
  ],
  controllers: [],
  providers: [],
})
export class AppWorkerModule {}
