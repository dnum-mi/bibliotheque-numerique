import { Controller, Get, Param, Delete } from "@nestjs/common";
import { OrganismesDatasService } from "./organismes_datas.service";

@Controller("organismes-datas")
export class OrganismesDatasController {
  constructor(
    private readonly organismesDatasService: OrganismesDatasService,
  ) {}

  @Get()
  findAll() {
    return this.organismesDatasService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.organismesDatasService.findOne(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.organismesDatasService.remove(+id);
  }
}
