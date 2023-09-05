import { Body, Controller, HttpCode, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { PermissionsGuard, RequirePermissions } from '../../roles/providers/permissions.guard'
import { PermissionName } from '@/shared/types/Permission.type'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CurrentDemarcheInterceptor } from '../providers/interceptors/current-demarche.interceptor'
import { Demarche } from '../objects/entities/demarche.entity'
import { DossierSearchService } from '../../dossiers/providers/dossier-search.service'
import { FieldSearchService } from '../../dossiers/providers/field-search.service'
import { DossierSearchOutputDto, FieldSearchOutputDto, SearchDossierDto } from '@biblio-num/shared'
import { CurrentDemarche } from '@/modules/demarches/providers/decorators/current-demarche.decorator'

@ApiTags('Demarches')
@ApiTags('Dossiers')
@UseGuards(PermissionsGuard)
@RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
@UseInterceptors(CurrentDemarcheInterceptor)
@Controller('demarches/:demarcheId')
export class DemarcheDossierController {
  constructor (private readonly logger: LoggerService,
               private dossierSearchService: DossierSearchService,
               private fieldSearchService: FieldSearchService) {
    this.logger.setContext(this.constructor.name)
  }

  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @Post('/dossiers-search')
  async searchDossier(@Body() dto: SearchDossierDto,
                      @CurrentDemarche() demarche: Partial<Demarche>): Promise<DossierSearchOutputDto> {
    this.logger.verbose('searchDossier')
    return this.dossierSearchService.search(demarche, dto)
  }

  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @Post('/fields-search')
  async searchFields(@Body() dto: SearchDossierDto,
                     @CurrentDemarche() demarche: Partial<Demarche>): Promise<FieldSearchOutputDto> {
    this.logger.verbose('searchDossier')
    return this.fieldSearchService.search(demarche, dto)
  }
}
