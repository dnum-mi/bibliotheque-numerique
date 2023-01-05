import { Controller, Get, Param, Delete } from "@nestjs/common";
import { Organismes_sourcesService } from "./organismes_sources.service";

@Controller("organismes-sources")
export class OrganismesSourcesController {
  constructor(
    private readonly organismesSourcesService: Organismes_sourcesService,
  ) {}

  @Get()
  findAll() {
    return this.organismesSourcesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.organismesSourcesService.findOne(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.organismesSourcesService.remove(+id);
  }
}
