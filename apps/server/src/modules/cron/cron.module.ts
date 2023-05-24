import { Module } from "@nestjs/common";
import { DossiersDSModule } from "../dossiers_ds/dossiers_ds.module";
import { CronService } from "./cron.service";
import { LoggerModule } from "../logger/logger.module";
import { JobLogModule } from "../job-log/job-log.module";

@Module({
  imports: [
    //TODO: Logger module should be global (see @Global at nestjs docs)
    LoggerModule,

    DossiersDSModule,
    JobLogModule,
  ],
  controllers: [],
  providers: [CronService],
})
export class CronModule {}
