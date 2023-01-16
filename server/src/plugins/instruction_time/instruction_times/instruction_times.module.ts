import { Module } from "@nestjs/common";
import { InstructionTimesService } from "./instruction_times.service";
import { InstructionTimesController } from "./instruction_times.controller";

@Module({
  controllers: [InstructionTimesController],
  providers: [InstructionTimesService],
})
export class InstructionTimesModule {}
