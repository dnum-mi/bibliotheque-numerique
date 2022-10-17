import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DemarcheEntity } from "../entities";
import { DemarchesController } from "./demarches.controller";
import { DemarchesService } from "./demarches.service";

@Module({
  imports: [TypeOrmModule.forFeature([DemarcheEntity])],
  controllers: [DemarchesController],
  providers: [DemarchesService],
  exports: [DemarchesService],
})
export class DemarchesModule {}
