import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { SearchDossierDto } from '@/modules/dossiers/objects/dto/search-dossier.dto'
import { FieldSearchOutputDto } from '@/modules/dossiers/objects/dto/fields/field-search-output.dto'
import {
  adjustDto,
  buildPaginationQuery,
  buildSortQuery,
} from '@/shared/pagination/utils/common-search.utils'
import { buildFilterQueryWithWhere } from '@/shared/pagination/utils/build-filter.utils'
import { fromMappingColumnArrayToTypeHash } from '@/modules/demarches/utils/demarche.utils'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { DossierSearchOutputDto } from '@/modules/dossiers/objects/dto/dossier-search-output.dto'
import { ProjectionManagerService } from '@/modules/projection/services/projection-manager/projection-manager.service'

@Injectable()
export class ProjectionSearchService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  async searchField(
    demarche: Demarche,
    dto: SearchDossierDto,
    complete = false,
  ): Promise<FieldSearchOutputDto> {
    this.logger.verbose('searchField projection')

    dto = adjustDto(dto)

    const tableName = ProjectionManagerService.buildFieldTableName(demarche.id)

    const typeHash = fromMappingColumnArrayToTypeHash(
      demarche.mappingColumns,
    )

    const filterSql = await buildFilterQueryWithWhere(
      dto.filters,
      typeHash,
    )

    const sortSql = buildSortQuery(dto.sorts)
    const paginationSql = complete
      ? ''
      : buildPaginationQuery(dto.page || 1, dto.perPage || 20)

    const selectedColumnsSql = dto.columns.length
      ? dto.columns.map((c) => `"${c}"`).join(',')
      : '*'

    const query = `
      SELECT
        "dossierId",
        ${selectedColumnsSql},
        COUNT(*) OVER() AS total
      FROM "${tableName}"
      ${filterSql}
      ${sortSql}
      ${paginationSql}
    `

    this.logger.debug(query)

    const result = await this.dataSource.query(query)

    if (!result[0]) {
      return { total: 0, data: [] }
    }

    const total = parseInt(result[0].total)

    return {
      total,
      data: result.map((r) => {
        delete r.total
        return r
      }),
    }
  }

  async searchDossier(
    demarche: Demarche,
    dto: SearchDossierDto,
    complete = false,
  ): Promise<DossierSearchOutputDto> {
    this.logger.verbose('searchDossier')

    dto = adjustDto(dto)

    const tableName = ProjectionManagerService.buildDossierTableName(demarche.id)

    const typeHash = fromMappingColumnArrayToTypeHash(
      demarche.mappingColumns,
    )

    dto.columns = dto.columns?.filter((c) => !!typeHash[c]) || []

    const filterSql = await buildFilterQueryWithWhere(dto.filters, typeHash, true)

    const sortSql = buildSortQuery(dto.sorts)

    const paginationSql = complete
      ? ''
      : buildPaginationQuery(dto.page || 1, dto.perPage || 20)

    const selectedColumnsSql = dto.columns.length
      ? dto.columns.map((c) => `"${c}"`).join(',')
      : '*'

    const query = `
      SELECT
        "dossierId",
        ${selectedColumnsSql},
        COUNT(*) OVER() AS total
      FROM "${tableName}"
      ${filterSql}
      ${sortSql}
      ${paginationSql}
    `

    this.logger.debug(query)

    const result = await this.dataSource.query(query)

    if (!result?.[0]) {
      return { total: 0, data: [] }
    }

    const total = parseInt(result[0].total)

    return {
      total,
      data: result.map((r) => {
        delete r.total
        return r
      }),
    }
  }
}
