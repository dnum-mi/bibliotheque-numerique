import { forwardRef, Module } from "@nestjs/common";
import { InstructionTimesService } from "./instruction_times.service";
import { InstructionTimesController } from "./instruction_times.controller";
import { ConfigModule } from "@nestjs/config";
import instructionTimeMappingConfig from "../config/instructionTimeMapping.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InstructionTime } from "./instruction_time.entity";
import { DossierModule } from "../../../modules/dossiers/dossier.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [instructionTimeMappingConfig],
    }),
    TypeOrmModule.forFeature([InstructionTime]),
    forwardRef(() => DossierModule),
  ],
  controllers: [InstructionTimesController],
  providers: [InstructionTimesService],
  exports: [InstructionTimesService],
})
export class InstructionTimesModule {}
