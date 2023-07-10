import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  HttpCode,
  NotFoundException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FilterPipe } from "../../../shared/pipe/filter.pipe";
import { DossiersService } from "../providers/dossiers.service";
import { Dossier } from "../entities/dossier.entity";
import { DeleteResult } from "typeorm";

@ApiTags("Dossiers")
@Controller("dossiers")
export class DossiersController {
  constructor(private readonly dossiersService: DossiersService) {}

  @Get()
  async findAll(): Promise<Dossier[]> {
    const dossiers = await this.dossiersService.findAll();
    if (dossiers.length === 0) {
      throw new NotFoundException("No dossier found");
    }
    return dossiers;
  }

  @Post("search")
  async searchDossier(
    @Body("filter", FilterPipe) filter: object,
  ): Promise<Dossier[]> {
    return this.dossiersService.findWithFilter(filter);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Dossier> {
    const dossier = await this.dossiersService.findOne(+id);
    if (!dossier) {
      throw new NotFoundException(`Dossier id: ${id} not found`);
    }
    return dossier;
  }

  @Get(":id/detail")
  async findOneWithDetail(@Param("id") id: string): Promise<Dossier> {
    const dossier = await this.dossiersService.findOneWithDetail(+id);
    if (!dossier) {
      throw new NotFoundException(`Dossier id: ${id} not found`);
    }
    return dossier;
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@Param("id") id: string): Promise<DeleteResult> {
    return this.dossiersService.remove(+id);
  }
}
