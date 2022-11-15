import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import { DemarchesService } from "./demarches.service";
import { Demarche } from "../entities";
import { Demarche as TDemarche } from "@lab-mi/ds-api-client/dist/@types/types";

type ReturnDemarche = Omit<TDemarche, "id"> & { id: number };

@Controller("demarches")
export class DemarchesController {
  constructor(private readonly demarcheService: DemarchesService) {}

  @Get()
  async getDemarches(): Promise<{ demarches: ReturnDemarche[] }> {
    let demarches: Demarche[];
    try {
      demarches = await this.demarcheService.findAll();
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

    if (demarches.length === 0) {
      throw new HttpException("No demarche found", HttpStatus.NOT_FOUND);
    }
    return {
      demarches: demarches.map((demarche) => ({
        ...demarche?.demarcheDS?.dataJson,
        id: demarche.id,
        originalId: demarche?.demarcheDS?.id,
      })),
    };
  }

  @Get(":id")
  async getDemarcheById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ demarche: ReturnDemarche }> {
    let demarche: Demarche;
    try {
      demarche = await this.demarcheService.findById(id);
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

    if (!demarche) {
      throw new HttpException(
        `Demarche id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      demarche: {
        ...demarche?.demarcheDS?.dataJson,
        id: demarche.id,
      },
    };
  }

  @Get("ds/:id")
  async getDemarcheByDsId(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ demarche: ReturnDemarche }> {
    let demarche: Demarche;
    try {
      demarche = await this.demarcheService.findByDsId(id);
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

    if (!demarche) {
      throw new HttpException(
        `Demarche number: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      demarche: {
        ...demarche?.demarcheDS?.dataJson,
        id: demarche.id,
      },
    };
  }

  @Get(":id/dossiers")
  async getDemarcheDossiersById(@Param("id") id: number) {
    let demarche: Demarche;
    try {
      demarche = await this.demarcheService.findById(id);
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

    if (!demarche) {
      throw new HttpException(
        `Demarche id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return demarche.dossiers;
  }
}
