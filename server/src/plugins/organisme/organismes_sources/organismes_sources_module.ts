import { Module } from "@nestjs/common";
import { Organismes_sourcesService } from "./organismes_sources.service";
import { OrganismesSourcesController } from "./organismes_sources_controller";

@Module({
  controllers: [OrganismesSourcesController],
  providers: [Organismes_sourcesService],
})
export class OrganismesSourcesModule {}
