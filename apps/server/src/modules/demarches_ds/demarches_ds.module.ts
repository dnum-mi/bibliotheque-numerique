import { Module } from "@nestjs/common";
import { DemarchesDSService } from "./demarches_ds.service";
import { DemarchesModule } from "../demarches/demarches.module";

// TODO: this should be gathered with DemarcheModule
@Module({
  imports: [DemarchesModule],
  providers: [DemarchesDSService],
  exports: [DemarchesDSService],
})
export class DemarchesDSModule {}
