import { Module } from "@nestjs/common";
import { CronService } from "./cron.service";
import { LoggerModule } from "../logger/logger.module";
import { DossiersModule } from "../dossiers/dossiers.module";
import { JobLogModule } from "../job-log/job-log.module";
import { DemarchesModule } from "../demarches/demarches.module";

@Module({
  imports: [
    //TODO: Logger module should be global (see @Global at nestjs docs)
    LoggerModule,
    DossiersModule,
    DemarchesModule,
    JobLogModule,
  ],
  controllers: [],
  providers: [CronService],
})
export class CronModule {}
