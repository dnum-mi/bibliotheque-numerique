import {
  Body,
  Controller,
  Header,
  HttpCode,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common'
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CurrentDemarcheInterceptor } from '../providers/interceptors/current-demarche.interceptor'
import { Demarche } from '../objects/entities/demarche.entity'
import { DossierSearchService } from '../../dossiers/providers/search/dossier-search.service'
import { FieldSearchService } from '../../dossiers/providers/search/field-search.service'

import { Roles } from '@biblio-num/shared'
import { CurrentDemarche } from '@/modules/demarches/providers/decorators/current-demarche.decorator'
import { ServerResponse } from 'http'
import { XlsxService } from '@/shared/modules/xlsx/xlsx.service'
import { ReadStream } from 'fs'
import { fromMappingColumnArrayToLabelHash } from '../utils/demarche.utils'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { xlsxContent } from '@/shared/modules/xlsx/xlsx.constants'
import { SearchDossierDto } from '@/modules/dossiers/objects/dto/search-dossier.dto'
import { FieldSearchOutputDto } from '@/modules/dossiers/objects/dto/fields/field-search-output.dto'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'
import { DossierSearchOutputDto } from '@/modules/dossiers/objects/dto/dossier-search-output.dto'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { PaginatedDto } from '@/shared/pagination/paginated.dto'

@ApiTags('Demarches', 'Dossiers')
@UseInterceptors(CurrentDemarcheInterceptor)
@Controller('demarches/:demarcheId')
export class DemarcheDossierController {
  constructor(
    private readonly logger: LoggerService,
    private dossierSearchService: DossierSearchService,
    private fieldSearchService: FieldSearchService,
    private xlsxService: XlsxService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @HttpCode(200)
  @ApiResponse({ status: 200 })
  @Role(Roles.instructor)
  @Post('/dossiers-search')
  @UsualApiOperation({
    summary: 'Lister les dossiers de la démarche.',
    method: 'POST',
    minimumRole: Roles.instructor,
    responseType: PaginatedDto,
    isPagination: true,
  })
  async searchDossier(
    @Body() dto: SearchDossierDto,
    @CurrentDemarche() demarche: Demarche,
  ): Promise<DossierSearchOutputDto> {
    this.logger.verbose('searchDossier')
    return this.dossierSearchService.search(demarche, dto)
  }

  @HttpCode(200)
  @ApiResponse({ status: 200 })
  @Post('/fields-search')
  @UsualApiOperation({
    summary: 'Lister les dossiers par champs de la démarche.',
    supplement:
      'Pour comprendre la différence entre cette route et dossier-search,' +
      ' voir la documentation sur la pagination.',
    method: 'POST',
    minimumRole: Roles.instructor,
    responseType: PaginatedDto,
    isPagination: true,
  })
  @Role(Roles.instructor)
  async searchFields(
    @Body() dto: SearchDossierDto,
    @CurrentDemarche() demarche: Demarche,
  ): Promise<FieldSearchOutputDto> {
    this.logger.verbose('searchDossier')
    return this.fieldSearchService.search(demarche, dto)
  }

  private _fromDataToXlsx = (
    mappingColumns: MappingColumn[],
    data,
  ): ReadStream => {
    const mch = fromMappingColumnArrayToLabelHash(mappingColumns)
    return this.xlsxService.generateXlsxFile(
      data.map((e) =>
        Object.fromEntries(
          Object.entries(e)
            .map(([idKey, value]) => {
              if (mch[idKey]) {
                return [
                  mch[idKey],
                  value instanceof Array ? value.join(', ') : value,
                ]
              }
              return null
            })
            .filter((a) => !!a),
        ),
      ),
    )
  }

  @HttpCode(200)
  @ApiResponse({ status: 200 })
  @ApiOkResponse({
    description: 'Excel file served successfully',
    content: xlsxContent,
  })
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'export.xlsx')
  @Post('/dossiers-search/export/xlsx')
  @UsualApiOperation({
    summary: 'Exporter la liste.',
    supplement:
      "l'export sera sous forme XLSX et représentera le résultat de la pagination sans les pages." +
      " C'est à dire l'ensemble des données correspondant au critère de pagination.",
    method: 'POST',
    minimumRole: Roles.instructor,
    responseType: null,
    isPagination: true,
  })
  @Role(Roles.instructor) // TODO: role - filter with options
  async searchDossierExport(
    @Body() dto: SearchDossierDto,
    @Res() res: ServerResponse,
    @CurrentDemarche() demarche: Demarche,
  ): Promise<void> {
    this.logger.verbose('searchDossierExport')
    const data = (await this.dossierSearchService.search(demarche, dto, true))
      .data
    this._fromDataToXlsx(demarche.mappingColumns, data).pipe(res)
  }

  @HttpCode(200)
  @ApiResponse({ status: 200 })
  @ApiOkResponse({
    description: 'Excel file served successfully',
    content: xlsxContent,
  })
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'export.xlsx')
  @UsualApiOperation({
    summary: 'Exporter la liste.',
    supplement:
      "l'export sera sous forme XLSX et représentera le résultat de la pagination sans les pages." +
      " C'est à dire l'ensemble des données correspondant au critère de pagination.",
    method: 'POST',
    minimumRole: Roles.instructor,
    responseType: null,
    isPagination: true,
  })
  @Post('/fields-search/export/xlsx')
  @Role(Roles.instructor) // TODO: role - filter with options
  async searchFieldsExport(
    @Body() dto: SearchDossierDto,
    @Res() res: ServerResponse,
    @CurrentDemarche() demarche: Demarche,
  ): Promise<void> {
    this.logger.verbose('searchDossierExport')
    const data = (await this.fieldSearchService.search(demarche, dto, true))
      .data
    this._fromDataToXlsx(demarche.mappingColumns, data).pipe(res)
  }
}
