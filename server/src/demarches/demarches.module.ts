import { Module } from "@nestjs/common";
import { DemarchesController } from "./demarches.controller";
import { DemarchesService } from "./demarches.service";
import { DemarchesDSService } from "../demarches_ds/demarches_ds.service";

@Module({
  controllers: [DemarchesController],
  providers: [DemarchesService, DemarchesDSService],
  exports: [DemarchesService],
})
export class DemarchesModule {}
