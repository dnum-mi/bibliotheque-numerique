import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Body,
  Post,
  ParseIntPipe,
} from "@nestjs/common";
import { OrganismesSourcesService } from "./organismes_sources.service";
import { Roles, RolesGuard } from "../../../guards/roles.guard";
import { OrganismesSource } from "../entities";

@Controller("organismes-sources")
@UseGuards(RolesGuard)
export class OrganismesSourcesController {
  constructor(
    private readonly organismesSourcesService: OrganismesSourcesService,
  ) {}

  @Roles("admin")
  @Get()
  findAll() {
    return this.organismesSourcesService.findAll();
  }

  @Roles("admin")
  @Get(":id")
  findOneById(@Param("id", ParseIntPipe) id: number) {
    return this.organismesSourcesService.findOneById(id);
  }

  @Roles("admin")
  @Get("name/:name")
  findOneBySourceName(@Param("name") name: string) {
    return this.organismesSourcesService.findOneBySourceName(name);
  }

  @Roles("admin")
  @Post()
  create(
    @Body()
    organismesSource: Partial<OrganismesSource>,
  ) {
    return this.organismesSourcesService.upsert(organismesSource);
  }

  @Roles("admin")
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.organismesSourcesService.remove(id);
  }
}
