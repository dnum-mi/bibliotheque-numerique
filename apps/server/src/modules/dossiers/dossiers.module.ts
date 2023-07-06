import { forwardRef, Module } from "@nestjs/common";
import { DossiersService } from "./providers/dossiers.service";
import { DossiersController } from "./controllers/dossiers.controller";
import { DossiersDSService } from "./providers/dossiers_ds.service";
import { FilesModule } from "../files/files.module";
import { InstructionTimesModule } from "../../plugins/instruction_time/instruction_times/instruction_times.module";
import { DemarchesModule } from "../demarches/demarches.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Dossier } from "./entities/dossier.entity";
import { DossierDS } from "./entities/dossier_ds.entity";

@Module({
  imports: [
    FilesModule,
    forwardRef(() => InstructionTimesModule),
    forwardRef(() => DemarchesModule),
    TypeOrmModule.forFeature([Dossier, DossierDS]),
  ],
  controllers: [DossiersController],
  providers: [DossiersService, DossiersDSService],
  exports: [DossiersService, DossiersDSService],
})
export class DossiersModule {}
