import { Controller, Get, Param, Delete } from "@nestjs/common";
import { DossiersService } from "./dossiers.service";

@Controller("dossiers")
export class DossiersController {
  constructor(private readonly dossiersService: DossiersService) {}

  @Get()
  findAll() {
    return this.dossiersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.dossiersService.findOne(+id);
  }

  @Get(":id/detail")
  findOneWithDetail(@Param("id") id: string) {
    return this.dossiersService.findOneWithDetail(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.dossiersService.remove(+id);
  }
}
