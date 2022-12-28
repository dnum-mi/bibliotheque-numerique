import { Module } from "@nestjs/common";
import { DossiersDSService } from "./dossiers_ds.service";
import { DossiersModule } from "../dossiers/dossiers.module";

@Module({
  imports: [DossiersModule],
  providers: [DossiersDSService],
})
export class DossiersDSModule {}
