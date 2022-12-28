import { Module } from "@nestjs/common";
import { DemarchesController } from "./demarches.controller";
import { DemarchesService } from "./demarches.service";

@Module({
  controllers: [DemarchesController],
  providers: [DemarchesService],
  exports: [DemarchesService],
})
export class DemarchesModule {}
