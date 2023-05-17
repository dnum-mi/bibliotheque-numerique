import { Module } from "@nestjs/common";
import { DemarchesDSModule } from "../../demarches_ds/demarches_ds.module";
import { DossiersDSModule } from "../../dossiers_ds/dossiers_ds.module";
import { CronService } from "./cron.service";
import { LoggerModule } from "../../logger/logger.module";

@Module({
  imports: [
    //TODO: Logger module should be global (see @Global at nestjs docs)
    LoggerModule,

    DemarchesDSModule,
    DossiersDSModule,
  ],
  controllers: [],
  providers: [CronService],
})
export class CronModule {}
