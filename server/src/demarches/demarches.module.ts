import { Module } from "@nestjs/common";
import { DemarchesController } from "./demarches.controller";
import { DemarchesService } from "./demarches.service";

@Module({
  imports: [],
  controllers: [DemarchesController],
  providers: [DemarchesService],
})
export class DemarchesModule {}
