import {
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
  Body,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import { DemarchesService } from "./demarches.service";
import { Demarche, Dossier } from "../entities";
import { FilterPipe } from "../pipe/filter.pipe";
import { DemarchesDSService } from "../demarches_ds/demarches_ds.service";

@Controller("demarches")
export class DemarchesController {
  constructor(
    private readonly demarcheService: DemarchesService,
    private readonly dossierDSServices: DemarchesDSService,
  ) {}

  @Get()
  async getDemarches(): Promise<Demarche[]> {
    let demarches: Demarche[];
    try {
      demarches = await this.demarcheService.findWithFilter();
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
    return demarches;
  }

  @Post("search")
  async searchDemarches(
    @Body("filter", FilterPipe) filter: object,
  ): Promise<Demarche[]> {
    let demarches: Demarche[];
    try {
      demarches = await this.demarcheService.findWithFilter(filter);
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

    return demarches;
  }

  @Get(":id")
  async getDemarcheById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Demarche> {
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
    return demarche;
  }

  @Get("ds/:id")
  async getDemarcheByDsId(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Demarche> {
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
    return demarche;
  }

  @Get(":id/dossiers")
  async getDemarcheDossiersById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Dossier[]> {
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

  @Post("create")
  async create(@Body("idDs", ParseIntPipe) idDs: number) {
    try {
      const demarche = await this.demarcheService.findByDsId(idDs);

      if (demarche)
        return { message: `Demarche id: ${idDs} exists, nothing to do.` };

      // TODO: Run this upsert in a Job
      await this.dossierDSServices.upsertDemarchesDSAndDemarches([idDs]);

      return { message: `Demarche id: ${idDs} create success!` };
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
