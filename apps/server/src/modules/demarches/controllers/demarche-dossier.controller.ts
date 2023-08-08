import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  PermissionsGuard,
  RequirePermissions,
} from "../../roles/providers/permissions.guard";
import { PermissionName } from "../../../shared/types/Permission.type";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { Dossier } from "../../dossiers/objects/entities/dossier.entity";
import { DemarcheExistGuard } from "../providers/guards/demarche-exist.guard";

@ApiTags("Demarches")
@ApiTags("Dossiers")
@UseGuards(PermissionsGuard)
@RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
@UseGuards(DemarcheExistGuard)
@Controller("demarches/:demarcheId/dossiers")
export class DemarcheDossierController {
  constructor(
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get()
  async listDossiers(): Promise<Dossier[]> {
    return [];
  }
}
