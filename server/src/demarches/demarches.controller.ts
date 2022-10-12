import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from "@nestjs/common";
import { DemarchesService } from "./demarches.service";
import { Demarche } from "@lab-mi/ds-api-client/dist/@types/types";

@Controller("demarches")
export class DemarchesController {
  constructor(private readonly demarcheService: DemarchesService) {}

  @Get()
  async getDemarches(): Promise<{ demarches: Partial<Demarche>[] }> {
    try {
      return {
        demarches: [
          (await this.demarcheService.getDemarche(1)).demarche,
          (await this.demarcheService.getDemarche(2)).demarche,
          (await this.demarcheService.getDemarche(3)).demarche,
        ],
      };
    } catch (error) {
      throw new HttpException("Demarche not found", HttpStatus.NOT_FOUND);
    }
  }

  @Get(":id")
  async getDemarcheById(
    @Param("id") id: string,
  ): Promise<{ demarche: Partial<any> }> {
    try {
      return await this.demarcheService.getDemarche(parseInt(id));
    } catch (error) {
      throw new HttpException("Demarche not found", HttpStatus.NOT_FOUND);
    }
  }
}
