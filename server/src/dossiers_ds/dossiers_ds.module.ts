import { Module } from "@nestjs/common";
import { DossiersDSService } from "./dossiers_ds.service";

@Module({
  providers: [DossiersDSService],
})
export class DossiersDSModule {}
