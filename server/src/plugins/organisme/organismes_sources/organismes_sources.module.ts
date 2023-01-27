import { Module } from "@nestjs/common";
import { OrganismesSourcesService } from "./organismes_sources.service";
import { OrganismesSourcesController } from "./organismes_sources.controller";

@Module({
  controllers: [OrganismesSourcesController],
  providers: [OrganismesSourcesService],
})
export class OrganismesSourcesModule {}
