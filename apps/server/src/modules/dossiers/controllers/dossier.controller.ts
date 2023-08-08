import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DossierService } from "../providers/dossier.service";
import { Dossier } from "../objects/entities/dossier.entity";
import { DeleteResult } from "typeorm";

@ApiTags('Dossiers')
@Controller('dossiers')
export class DossierController {
  constructor (private readonly dossiersService: DossierService) {}

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Dossier> {
    const dossier = await this.dossiersService.findOne(+id);
    if (!dossier) {
      throw new NotFoundException(`Dossier id: ${id} not found`)
    }
    return dossier
  }

  @Get(':id/detail')
  async findOneWithDetail (@Param('id') id: string): Promise<Dossier> {
    const dossier = await this.dossiersService.findOneWithDetail(+id)
    if (!dossier) {
      throw new NotFoundException(`Dossier id: ${id} not found`)
    }
    return dossier
  }
}
