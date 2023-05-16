import { Module } from "@nestjs/common";
import { DossiersDSService } from "./dossiers_ds.service";
import { DossiersModule } from "../dossiers/dossiers.module";
import { FilesModule } from "../files/files.module";

// TODO: this should be gathered with DossierModule
@Module({
  imports: [DossiersModule, FilesModule],
  providers: [DossiersDSService],
  exports: [DossiersDSService],
})
export class DossiersDSModule {}
