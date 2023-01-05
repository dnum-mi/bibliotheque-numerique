import { Module } from "@nestjs/common";
import { OrganismesService } from "./organismes.service";
import { OrganismesController } from "./organismes.controller";

@Module({
  controllers: [OrganismesController],
  providers: [OrganismesService],
})
export class OrganismesModule {}
