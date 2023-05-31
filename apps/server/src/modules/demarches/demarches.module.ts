import { Module } from "@nestjs/common";
import { DemarchesController } from "./controllers/demarches.controller";
import { DemarchesService } from "./providers/demarches.service";
import { DemarchesDSService } from "./providers/demarches_ds.service";
import { DossiersModule } from "../dossiers/dossiers.module";

@Module({
  imports: [DossiersModule],
  controllers: [DemarchesController],
  providers: [DemarchesService, DemarchesDSService],
  exports: [DemarchesService, DemarchesDSService],
})
export class DemarchesModule {}
