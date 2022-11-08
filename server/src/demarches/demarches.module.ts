import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Demarche } from "../entities";
import { DemarchesController } from "./demarches.controller";
import { DemarchesService } from "./demarches.service";

@Module({
  imports: [TypeOrmModule.forFeature([Demarche])],
  controllers: [DemarchesController],
  providers: [DemarchesService],
  exports: [DemarchesService],
})
export class DemarchesModule {}
