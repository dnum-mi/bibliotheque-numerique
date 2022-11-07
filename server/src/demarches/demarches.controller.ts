import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import { DemarchesService } from "./demarches.service";
import { Demarche } from "@lab-mi/ds-api-client/dist/@types/types";

type ReturnDemarche = Omit<Demarche, "id"> & { id: number };

@Controller("demarches")
export class DemarchesController {
  constructor(private readonly demarcheService: DemarchesService) {}

  @Get()
  async getDemarches(): Promise<{ demarches: ReturnDemarche[] }> {
    try {
      const demarches = await this.demarcheService.findAll();
      return {
        demarches: demarches.map((demarche) => ({
          ...demarche?.demarcheDS?.dataJson,
          id: demarche.id,
          originalId: demarche?.demarcheDS?.id,
        })),
      };
    } catch (error) {
      throw new HttpException("Demarche not found", HttpStatus.NOT_FOUND);
    }
  }

  @Get(":id")
  async getDemarcheById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ demarche: ReturnDemarche }> {
    try {
      const demarche = await this.demarcheService.findById(id);
      return {
        demarche: {
          ...demarche?.demarcheDS?.dataJson,
          id: demarche.id,
        },
      };
    } catch (error) {
      throw new HttpException("Demarche not found", HttpStatus.NOT_FOUND);
    }
  }

  @Get("ds/:id")
  async getDemarcheByDsId(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ demarche: ReturnDemarche }> {
    try {
      const demarche = await this.demarcheService.findByDsId(id);
      return {
        demarche: {
          ...demarche?.demarcheDS?.dataJson,
          id: demarche.id,
        },
      };
    } catch (error) {
      throw new HttpException("Demarche not found", HttpStatus.NOT_FOUND);
    }
  }

  @Get(":id/dossiers")
  async getDemarcheDossiersById(@Param("id") id: number) {
    try {
      const demarche = await this.demarcheService.findById(id);
      return demarche.dossiers;
    } catch (error) {
      throw new HttpException(
        "Demarche dossiers not found",
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
