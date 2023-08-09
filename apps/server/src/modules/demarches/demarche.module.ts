import { forwardRef, Module } from "@nestjs/common";
import { DemarcheController } from "./controllers/demarche.controller";
import { DemarcheService } from "./providers/demarche.service";
import { DossierModule } from "../dossiers/dossier.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Demarche } from "./objects/entities/demarche.entity";
import { DemarcheSynchroniseService } from "./providers/demarche-synchronise.service";

@Module({
  imports: [
    forwardRef(() => DossierModule),
    TypeOrmModule.forFeature([Demarche]),
  ],
  controllers: [DemarcheController],
  providers: [DemarcheService, DemarcheSynchroniseService],
  exports: [DemarcheService, DemarcheSynchroniseService],
})
export class DemarcheModule {}
