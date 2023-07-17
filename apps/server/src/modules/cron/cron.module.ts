import { Module } from "@nestjs/common";
import { CronService } from "./cron.service";
import { DossiersModule } from "../dossiers/dossiers.module";
import { JobLogModule } from "../job-log/job-log.module";
import { DemarchesModule } from "../demarches/demarches.module";
import { OrganismesModule } from "../../plugins/organisme/organismes/organismes.module";

@Module({
  imports: [DossiersModule, DemarchesModule, JobLogModule, OrganismesModule],
  controllers: [],
  providers: [CronService],
})
export class CronModule {}
