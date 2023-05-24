import { Module } from "@nestjs/common";
import { DemarchesController } from "./controllers/demarches.controller";
import { DemarchesService } from "./providers/demarches.service";
import { DemarchesDSService } from "./providers/demarches_ds.service";
import { DossiersDSModule } from "../dossiers_ds/dossiers_ds.module";

@Module({
  imports: [DossiersModule],
  controllers: [DemarchesController],
  providers: [DemarchesService, DemarchesDSService],
  exports: [DemarchesService, DemarchesDSService],
})
export class DemarchesModule {}
