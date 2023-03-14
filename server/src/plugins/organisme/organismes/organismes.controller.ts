import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Post,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { BNError } from "../../../utiles/bn_error.class";
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

  @Post("rna")
  async addOrgnaismeByIdRNA(
    @Body("idRNA") idRNA: string,
    @Body("source") source: string,
  ) {
    if (!idRNA) {
      throw new HttpException(
        `idRNA ${idRNA} is empty`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.organismesService.upsertOrganisme(idRNA, [source]);

      return { message: `organimse RNA: ${idRNA} create success!` };
    } catch (error) {
      if (error instanceof BNError) {
        throw new HttpException(
          `organimse RNA: ${idRNA} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        error instanceof Error ? error.message : "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
