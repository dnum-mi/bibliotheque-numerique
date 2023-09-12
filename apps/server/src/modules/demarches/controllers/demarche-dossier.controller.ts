import { Body, Controller, Header, HttpCode, Post, Res, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger'
import { PermissionsGuard, RequirePermissions } from '../../roles/providers/permissions.guard'
import { PermissionName } from '@/shared/types/Permission.type'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CurrentDemarcheInterceptor } from '../providers/interceptors/current-demarche.interceptor'
import { Demarche } from '../objects/entities/demarche.entity'
import { DossierSearchService } from '../../dossiers/providers/dossier-search.service'
import { FieldSearchService } from '../../dossiers/providers/field-search.service'
import { DossierSearchOutputDto, FieldSearchOutputDto, MappingColumn, SearchDossierDto } from '@biblio-num/shared'
import { CurrentDemarche } from '@/modules/demarches/providers/decorators/current-demarche.decorator'
import { ServerResponse } from 'http'
import { XlsxService } from '@/shared/modules/xlsx/xlsx.service'
import { ReadStream } from 'fs'

const xlsxContent = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    schema: {
      type: 'string',
      format: 'binary',
    },
  },
}

@ApiTags('Demarches')
@ApiTags('Dossiers')
@UseGuards(PermissionsGuard)
@UseInterceptors(CurrentDemarcheInterceptor)
@Controller('demarches/:demarcheId')
export class DemarcheDossierController {
  constructor (private readonly logger: LoggerService,
               private dossierSearchService: DossierSearchService,
               private fieldSearchService: FieldSearchService,
               private xlsxService: XlsxService) {
    this.logger.setContext(this.constructor.name)
  }

  @HttpCode(200)
  @ApiResponse({ status: 200 })
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  @Post('/dossiers-search')
  async searchDossier(@Body() dto: SearchDossierDto,
                      @CurrentDemarche() demarche: Partial<Demarche>): Promise<DossierSearchOutputDto> {
    this.logger.verbose('searchDossier')
    return this.dossierSearchService.search(demarche, dto)
  }

  @HttpCode(200)
  @ApiResponse({ status: 200 })
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  @Post('/fields-search')
  async searchFields(@Body() dto: SearchDossierDto,
                     @CurrentDemarche() demarche: Partial<Demarche>): Promise<FieldSearchOutputDto> {
    this.logger.verbose('searchDossier')
    return this.fieldSearchService.search(demarche, dto)
  }

  private _fromDataToXlsx = (mappingColumns: MappingColumn[], data): ReadStream => {
    const mch = Object.fromEntries(mappingColumns.map(mc =>
      mc.children?.length
        ? mc.children.map(mc2 => [mc2.id, mc2.columnLabel])
        : [[mc.id, mc.columnLabel]])
      .flat(1),
    )
    return this.xlsxService.generateXlsxFile(
      data.map(e => Object.fromEntries(
        Object.entries(e).map(([idKey, value]) => {
          if (mch[idKey]) {
            return [mch[idKey], value instanceof Array ? value.join(', ') : value]
          }
          return null
        }).filter(a => !!a),
      )),
    )
  }

  @HttpCode(200)
  @ApiResponse({ status: 200 })
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  @ApiOkResponse({ description: 'Excel file served successfully', content: xlsxContent })
  @Header('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'export.xlsx')
  @Post('/dossiers-search/export/xlsx')
  async searchDossierExport(@Body() dto: SearchDossierDto,
                            @Res() res: ServerResponse,
                            @CurrentDemarche() demarche: Partial<Demarche>): Promise<void> {
    this.logger.verbose('searchDossierExport')
    const data = (await this.dossierSearchService.search(demarche, dto, true)).data
    this._fromDataToXlsx(demarche.mappingColumns, data).pipe(res)
  }

  @HttpCode(200)
  @ApiResponse({ status: 200 })
  @RequirePermissions({ name: PermissionName.ACCESS_DEMARCHE })
  @ApiOkResponse({ description: 'Excel file served successfully', content: xlsxContent })
  @Header('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'export.xlsx')
  @Post('/fields-search/export/xlsx')
  async searchFieldsExport(@Body() dto: SearchDossierDto,
                     @Res() res: ServerResponse,
                     @CurrentDemarche() demarche: Partial<Demarche>): Promise<void> {
    this.logger.verbose('searchDossierExport')
    const data = (await this.fieldSearchService.search(demarche, dto, true)).data
    this._fromDataToXlsx(demarche.mappingColumns, data).pipe(res)
  }
}
