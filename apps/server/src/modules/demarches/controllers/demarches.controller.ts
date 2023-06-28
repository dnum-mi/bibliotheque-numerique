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
  Query,
  ParseArrayPipe,
  Patch,
  Logger,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DemarchesService } from "../providers/demarches.service";

import { FilterPipe } from "../../../shared/pipe/filter.pipe";
import { DemarchesDSService } from "../providers/demarches_ds.service";
import {
  PermissionsGuard,
  RequirePermissions,
} from "../../roles/providers/permissions.guard";
import { PermissionName } from "../../../shared/types/Permission.type";
import { filterObjectFields } from "@biblio-num/shared";
import { DossiersDSService } from "../../dossiers/providers/dossiers_ds.service";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { Demarche } from "../entities/demarche.entity";
import { Dossier } from "../../dossiers/entities/dossier.entity";

@ApiTags("Demarches")
@UseGuards(PermissionsGuard)
@Controller("demarches")
export class DemarchesController {
  private readonly logger = new Logger(
    DemarchesController.name,
  ) as unknown as LoggerService;

  constructor(
    private readonly demarcheService: DemarchesService,
    private readonly demarchesDSServices: DemarchesDSService,
    private readonly dossierDSServices: DossiersDSService,
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
    @Query("fields", new ParseArrayPipe({ separator: ",", optional: true }))
    fields: string[],
  ): Promise<Demarche | Partial<Demarche>> {
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
    return fields?.length > 0 ? filterObjectFields(fields, demarche) : demarche;
  }

  @Get("ds/:id")
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getDemarcheByDsId(
    @Request() req,
    @Param("id", ParseIntPipe) id: number,
    @Query("fields", new ParseArrayPipe({ separator: ",", optional: true }))
    fields?: string[],
  ): Promise<Demarche | Partial<Demarche>> {
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
    return fields?.length > 0 ? filterObjectFields(fields, demarche) : demarche;
  }

  @Get(":id/dossiers")
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
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
  @RequirePermissions()
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async create(@Body("idDs", ParseIntPipe) idDs: number) {
    try {
      const demarche = await this.demarcheService.findByDsId(idDs);

      if (demarche)
        return { message: `Demarche id: ${idDs} exists, nothing to do.` };

      // TODO: Run this upsert in a Job
      await this.demarchesDSServices.upsertDemarchesDSAndDemarches([idDs]);

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

  @Post("synchro_dossiers")
  @RequirePermissions()
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async synchroDossiers(@Body("id", ParseIntPipe) id: number) {
    try {
      const demarche = await this.demarcheService.findById(id);

      if (!demarche)
        throw new HttpException(
          `Demarche id: ${id} n'existe pas.`,
          HttpStatus.NOT_FOUND,
        );

      await this.dossierDSServices.upsertDemarcheDossiersDS(
        demarche.demarcheDS.id,
      );
      return {
        message: `Les dossiers de la demarche id ${id} sont synchronisés.`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error({
        short_message: error?.message || error,
        full_message: error?.stack,
      });
      throw new HttpException(
        error?.message || "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(":id")
  @RequirePermissions()
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async updateDemarche(
    @Param("id", ParseIntPipe) id: number,
    @Body() demarche: Partial<Demarche>,
  ) {
    try {
      await this.demarcheService.updateDemarche(id, demarche);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
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
