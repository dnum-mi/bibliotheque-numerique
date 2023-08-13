import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PermissionsGuard, RequirePermissions } from '../../roles/providers/permissions.guard'
import { PermissionName } from '../../../shared/types/Permission.type'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { DemarcheExistGuard } from '../providers/guards/demarche-exist.guard'
import { SearchDossierDto } from '../../dossiers/objects/dto/search-dossier.dto'
import { Demarche } from '../objects/entities/demarche.entity'
import { DemarcheParam } from '../providers/decorators/current-demarche.decorator'
import { DossierSearchService } from '../../dossiers/providers/dossier-search.service';

@ApiTags('Demarches')
@ApiTags('Dossiers')
@UseGuards(PermissionsGuard)
@RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
@UseGuards(DemarcheExistGuard)
@Controller('demarches/:demarcheId/dossiers')
export class DemarcheDossierController {
  constructor (private readonly logger: LoggerService,
               private dossierSearchService: DossierSearchService) {
    this.logger.setContext(this.constructor.name)
  }

  @Get()
  async searchDossier (@Query() dto: SearchDossierDto,
                       @DemarcheParam() demarche: Partial<Demarche>): Promise<{ total: number, data: any[] }> {
    this.logger.verbose('searchDossier')
    console.log(dto);
    return this.dossierSearchService.search(demarche, dto)
  }
}
