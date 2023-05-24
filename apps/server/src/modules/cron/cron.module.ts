import { Module } from "@nestjs/common";
import { CronService } from "./cron.service";
import { LoggerModule } from "../logger/logger.module";
import { DossiersModule } from "../dossiers/dossiers.module";
import { JobLogModule } from "../job-log/job-log.module";

@Module({
  imports: [
    //TODO: Logger module should be global (see @Global at nestjs docs)
    LoggerModule,
    DossiersModule,
    JobLogModule,
  ],
  controllers: [],
  providers: [CronService],
})
export class CronModule {}
