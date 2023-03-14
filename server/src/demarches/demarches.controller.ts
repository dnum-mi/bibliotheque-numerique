import {
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
  Request,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { DemarchesService } from "./demarches.service";
import { Demarche, Dossier } from "../entities";
import { FilterPipe } from "../pipe/filter.pipe";
import { DemarchesDSService } from "../demarches_ds/demarches_ds.service";
import {
  PermissionsGuard,
  RequirePermissions,
} from "../guards/permissions.guard";
import { PermissionName } from "../types/permission";

@UseGuards(PermissionsGuard)
@Controller("demarches")
export class DemarchesController {
  constructor(
    private readonly demarcheService: DemarchesService,
    private readonly dossierDSServices: DemarchesDSService,
  ) {}

  @Get()
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getDemarches(@Request() req): Promise<Demarche[]> {
    let demarches: Demarche[];
    try {
      demarches = await this.demarcheService.findWithFilter(req.user);
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
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async searchDemarches(
    @Request() req,
    @Body("filter", FilterPipe) filter: object,
  ): Promise<Demarche[]> {
    let demarches: Demarche[];
    try {
      demarches = await this.demarcheService.findWithFilter(req.user, filter);
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
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getDemarcheById(
    @Request() req,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Demarche> {
    const rules = this.demarcheService.getRulesFromUserPermissions(req.user);
    if (rules.id?.length > 0 && !rules.id.find((ruleId) => ruleId === id)) {
      throw new HttpException(
        `Not authorized access for demarche id: ${id}`,
        HttpStatus.FORBIDDEN,
      );
    }

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
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getDemarcheByDsId(
    @Request() req,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Demarche> {
    const rules = this.demarcheService.getRulesFromUserPermissions(req.user);
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

    if (
      rules.id?.length > 0 &&
      !rules.id.find((ruleId) => ruleId === demarche.id)
    ) {
      throw new HttpException(
        `Not authorized access for demarche id: ${id}`,
        HttpStatus.FORBIDDEN,
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
