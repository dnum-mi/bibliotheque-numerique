import { Module } from "@nestjs/common";
import { DemarchesDSService } from "./demarches_ds.service";
import { DemarchesModule } from "../demarches/demarches.module";

@Module({
  imports: [DemarchesModule],
  providers: [DemarchesDSService],
})
export class DemarchesDSModule {}
