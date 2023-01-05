import { Controller, Get, Body, Patch, Param, Delete } from "@nestjs/common";
import { OrganismesService } from "./organismes.service";

@Controller("organismes")
export class OrganismesController {
  constructor(private readonly organismesService: OrganismesService) {}

  @Get()
  findAll() {
    return this.organismesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.organismesService.findOne(+id);
  }
}
