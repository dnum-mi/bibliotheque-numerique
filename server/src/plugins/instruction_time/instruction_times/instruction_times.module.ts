import { Module } from "@nestjs/common";
import { InstructionTimesService } from "./instruction_times.service";
import { InstructionTimesController } from "./instruction_times.controller";
import { ConfigModule } from "@nestjs/config";
import instructionTimeMappingConfig from "../config/instructionTimeMapping.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [instructionTimeMappingConfig],
    }),
  ],
  controllers: [InstructionTimesController],
  providers: [InstructionTimesService],
})
export class InstructionTimesModule {}
