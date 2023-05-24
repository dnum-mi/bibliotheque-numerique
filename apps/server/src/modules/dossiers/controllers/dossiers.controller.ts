import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  HttpException,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { FilterPipe } from "../../shared/pipe/filter.pipe";
import { DossiersService } from "./dossiers.service";
import { Dossier } from "../../shared/entities";

@Controller("dossiers")
export class DossiersController {
  constructor(private readonly dossiersService: DossiersService) {}

  @Get()
  async findAll() {
    let dossiers: Dossier[];
    try {
      dossiers = await this.dossiersService.findWithFilter();
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (dossiers.length === 0) {
      throw new HttpException("No dossier found", HttpStatus.NOT_FOUND);
    }
    return dossiers;
  }

  @Post("search")
  async searchDossier(@Body("filter", FilterPipe) filter: object) {
    let dossiers: Dossier[];
    try {
      dossiers = await this.dossiersService.findWithFilter(filter);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return dossiers;
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    let dossier: Dossier;
    try {
      dossier = await this.dossiersService.findOne(+id);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!dossier) {
      throw new HttpException(
        `Dossier id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return dossier;
  }

  @Get(":id/detail")
  async findOneWithDetail(@Param("id") id: string) {
    let dossier: Dossier;
    try {
      dossier = await this.dossiersService.findOneWithDetail(+id);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!dossier) {
      throw new HttpException(
        `Dossier id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return dossier;
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@Param("id") id: string) {
    try {
      return await this.dossiersService.remove(+id);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
