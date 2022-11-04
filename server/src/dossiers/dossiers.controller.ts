import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { DossiersService } from "./dossiers.service";
import { CreateDossierDto } from "./dto/create-dossier.dto";
import { UpdateDossierDto } from "./dto/update-dossier.dto";

@Controller("dossiers")
export class DossiersController {
  constructor(private readonly dossiersService: DossiersService) {}

  @Post()
  create(@Body() createDossierDto: CreateDossierDto) {
    return this.dossiersService.create(createDossierDto);
  }

  @Get()
  findAll() {
    return this.dossiersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.dossiersService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDossierDto: UpdateDossierDto) {
    return this.dossiersService.update(+id, updateDossierDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.dossiersService.remove(+id);
  }
}
