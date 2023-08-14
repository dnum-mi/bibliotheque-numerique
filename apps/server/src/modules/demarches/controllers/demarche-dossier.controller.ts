import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
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
@Controller('demarches/:demarcheId')
export class DemarcheDossierController {
  constructor (private readonly logger: LoggerService,
               private dossierSearchService: DossierSearchService) {
    this.logger.setContext(this.constructor.name)
  }

  @ApiResponse({status: 200})
  @HttpCode(200)
  @Post('/dossiers-search')
  async searchDossier (@Body() dto: SearchDossierDto,
                       @DemarcheParam() demarche: Partial<Demarche>): Promise<{ total: number, data: any[] }> {
    this.logger.verbose('searchDossier')
    return this.dossierSearchService.search(demarche, dto)
  }
}
