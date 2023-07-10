import { forwardRef, Module } from "@nestjs/common";
import { DemarchesController } from "./controllers/demarches.controller";
import { DemarchesService } from "./providers/demarches.service";
import { DemarchesDSService } from "./providers/demarches_ds.service";
import { DossiersModule } from "../dossiers/dossiers.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Demarche } from "./entities/demarche.entity";
import { DemarcheDS } from "./entities/demarche_ds.entity";

@Module({
  imports: [
    forwardRef(() => DossiersModule),
    TypeOrmModule.forFeature([Demarche, DemarcheDS]),
  ],
  controllers: [DemarchesController],
  providers: [DemarchesService, DemarchesDSService],
  exports: [DemarchesService, DemarchesDSService],
})
export class DemarchesModule {}
