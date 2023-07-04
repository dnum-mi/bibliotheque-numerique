import {
  Controller,
  Get,
  Body,
  Param,
  Post,
  ParseIntPipe,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { OrganismesService } from "./organismes.service";
import { Organisme } from "../entities";

@ApiTags("Organismes")
@Controller("organismes")
export class OrganismesController {
  constructor(
    private readonly organismesService: OrganismesService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get()
  async findAll(): Promise<Organisme[]> {
    return this.organismesService.findAll();
  }

  @Get(":id")
  findOneById(@Param("id", ParseIntPipe) id: number): Promise<Organisme> {
    return this.organismesService.findOneById(id);
  }

  @Get("rna/:id")
  findOneByIdRna(@Param("id") id: string): Promise<Organisme> {
    return this.organismesService.findOneByIdRef(id);
  }

  @Post("rna")
  async addOrganismeByIdRNA(
    @Body("idRNA") idRNA: string,
    @Body("source") source: string,
  ): Promise<{ message: string }> {
    if (!idRNA) {
      throw new BadRequestException(`idRNA ${idRNA} is empty`);
    }
    await this.organismesService.upsertOrganisme(idRNA, [source]);
    return { message: `organisme RNA: ${idRNA} create success!` };
  }
}
