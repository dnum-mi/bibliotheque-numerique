import { Module } from "@nestjs/common";
import { DossiersService } from "./providers/dossiers.service";
import { DossiersController } from "./controllers/dossiers.controller";
import { DossiersDSService } from "./providers/dossiers_ds.service";
import { FilesModule } from "../files/files.module";
import { InstructionTimesModule } from "../../plugins/instruction_time/instruction_times/instruction_times.module";

@Module({
  imports: [FilesModule, InstructionTimesModule],
  controllers: [DossiersController],
  providers: [DossiersService, DossiersDSService],
  exports: [DossiersService, DossiersDSService],
})
export class DossiersModule {}
