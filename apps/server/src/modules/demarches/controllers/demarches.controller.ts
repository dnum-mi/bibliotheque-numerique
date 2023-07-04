import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
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
  constructor(
    private readonly demarcheService: DemarchesService,
    private readonly demarchesDSServices: DemarchesDSService,
    private readonly dossierDSServices: DossiersDSService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get()
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getDemarches(@Request() req): Promise<Demarche[]> {
    const demarches = await this.demarcheService.findWithFilter(req.user);
    if (demarches.length === 0) {
      throw new NotFoundException("No demarche found");
    }
    return demarches;
  }

  @Post("search")
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async searchDemarches(
    @Request() req,
    @Body("filter", FilterPipe) filter: object,
  ): Promise<Demarche[]> {
    return this.demarcheService.findWithFilter(req.user, filter);
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

    const demarche = await this.demarcheService.findById(id);
    if (!demarche) {
      throw new NotFoundException(`Demarche id: ${id} not found`);
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
    const demarche = await this.demarcheService.findByDsId(id);

    if (
      rules.id?.length > 0 &&
      !rules.id.find((ruleId) => ruleId === demarche.id)
    ) {
      throw new ForbiddenException(
        `Not authorized access for demarche id: ${id}`,
      );
    }
    if (!demarche) {
      throw new NotFoundException(`Demarche number: ${id} not found`);
    }
    return fields?.length > 0 ? filterObjectFields(fields, demarche) : demarche;
  }

  @Get(":id/dossiers")
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  async getDemarcheDossiersById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Dossier[]> {
    const demarche = await this.demarcheService.findById(id);
    if (!demarche) {
      throw new NotFoundException(`Demarche id: ${id} not found`);
    }
    return demarche.dossiers;
  }

  @Post("create")
  @RequirePermissions()
  async create(
    @Body("idDs", ParseIntPipe) idDs: number,
  ): Promise<{ message: string }> {
    const demarche = await this.demarcheService.findByDsId(idDs);

    if (demarche)
      return { message: `Demarche id: ${idDs} exists, nothing to do.` };

    // TODO: Run this upsert in a Job
    await this.demarchesDSServices.upsertDemarchesDSAndDemarches([idDs]);

    return { message: `Demarche id: ${idDs} create success!` };
  }

  @Post("synchro_dossiers")
  @RequirePermissions()
  async synchroDossiers(
    @Body("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const demarche = await this.demarcheService.findById(id);
    if (!demarche) {
      throw new NotFoundException(`Demarche id: ${id} n'existe pas.`);
    }

    await this.dossierDSServices.upsertDemarcheDossiersDS(
      demarche.demarcheDS.id,
    );
    return {
      message: `Les dossiers de la demarche id ${id} sont synchronisés.`,
    };
  }

  @Patch(":id")
  @RequirePermissions()
  async updateDemarche(
    @Param("id", ParseIntPipe) id: number,
    @Body() demarche: Partial<Demarche>,
  ): Promise<void> {
    await this.demarcheService.updateDemarche(id, demarche);
  }
}
