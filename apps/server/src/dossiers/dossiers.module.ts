import { Module } from "@nestjs/common";
import { DossiersService } from "./dossiers.service";
import { DossiersController } from "./dossiers.controller";
import { InstructionTimesModule } from "../plugins/instruction_time/instruction_times/instruction_times.module";

@Module({
  imports: [InstructionTimesModule],
  controllers: [DossiersController],
  providers: [DossiersService],
  exports: [DossiersService],
})
export class DossiersModule {}
