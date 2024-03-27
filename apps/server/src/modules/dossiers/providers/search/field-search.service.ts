import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Repository } from 'typeorm'
import { Dossier } from '../../objects/entities/dossier.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { Demarche } from '../../../demarches/objects/entities/demarche.entity'
import { Field } from '../../objects/entities/field.entity'
import {
  adjustDto,
  buildPaginationQuery,
  buildSortQuery,
  deduceFieldToQueryFromType,
} from '@/shared/pagination/utils/common-search.utils'
import { FieldService } from '../field.service'

import { fromMappingColumnArrayToTypeHash } from '@/modules/demarches/utils/demarche.utils'
import { FieldTypeKeys } from '@biblio-num/shared'
import { SearchDossierDto } from '@/modules/dossiers/objects/dto/search-dossier.dto'
import { FieldSearchOutputDto } from '@/modules/dossiers/objects/dto/fields/field-search-output.dto'
import { buildFilterQueryWithWhere } from '@/shared/pagination/utils/build-filter.utils'

@Injectable()
export class FieldSearchService extends BaseEntityService<Field> {
  constructor(
    @InjectRepository(Dossier) protected readonly repo: Repository<Field>,
    protected readonly logger: LoggerService,
    private readonly fieldService: FieldService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  private _buildCommonRepeatedCTE(
    demarcheId: number,
    fieldsId: string[],
    repeated: boolean,
  ): string {
    this.logger.verbose('_buildCommonRepeatedCTE')
    const repeatedLine = repeated
      ? `,COALESCE(ROW_NUMBER() OVER (PARTITION BY f."dossierId", f."sourceId" ORDER BY f."parentRowIndex"), 0)
        AS maxRowNbr`
      : ''
    const name = repeated ? 'repeatedCTE' : 'nonRepeatedCTE'
    return `
      ${name} AS (
        SELECT
          f."dossierId",
          f."sourceId",
          f."stringValue",
          f."dateValue",
          f."numberValue",
          f."parentId"
          ${repeatedLine}
        FROM fields f
        INNER JOIN dossiers d ON f."dossierId" = d.id
        WHERE f."parentRowIndex" IS ${repeated ? 'NOT ' : ''}NULL
        AND f."sourceId" IN (${fieldsId.map((id) => `'${id}'`).join(',')})
        AND d."demarcheId" = ${demarcheId}
      )
    `
  }

  private _buildRepeatedCTE(demarcheId: number, fieldsId: string[]): string {
    this.logger.verbose('_buildRepeatedCTE')
    return this._buildCommonRepeatedCTE(demarcheId, fieldsId, true)
  }

  private _buildNonRepeatedCTE(demarcheId: number, fieldsId: string[]): string {
    this.logger.verbose('_buildNonRepeatedCTE')
    return this._buildCommonRepeatedCTE(demarcheId, fieldsId, false)
  }

  private _buildCombinedCTE(
    fieldsId: string[],
    typeHash: Record<string, FieldTypeKeys>,
  ): string {
    this.logger.verbose('_buildRepeatedCTE')
    return `
      combinedCTE AS (
        SELECT
            n."dossierId",
            ${fieldsId
    .map((id: string) => {
      const field = deduceFieldToQueryFromType(typeHash[id])
      return `
        MAX(COALESCE(
          CASE WHEN n."sourceId" = '${id}' THEN n."${field}" END,
          CASE WHEN r."sourceId" = '${id}' THEN r."${field}" END)
        ) AS "${id}"
      `
    })
    .filter((a) => !!a)
    .join(',')}
        FROM nonRepeatedCTE n
        LEFT JOIN repeatedCTE r ON n."dossierId" = r."dossierId"
        GROUP BY n."dossierId", r.maxRowNbr, r."parentId"
      )
    `
  }

  private _buildCountedCTE(
    dto: SearchDossierDto,
    typeHash: Record<string, FieldTypeKeys>,
  ): string {
    this.logger.verbose('_buildRepeatedCTE')
    return `
      countedCTE AS (
        SELECT *, COUNT(*) OVER () AS total
        FROM combinedCTE
        ${buildFilterQueryWithWhere(dto.filters, typeHash)}
        ${buildSortQuery(dto.sorts)}
      )
    `
  }

  async search(
    demarche: Partial<Demarche>,
    dto: SearchDossierDto,
    complete = false,
  ): Promise<FieldSearchOutputDto> {
    this.logger.verbose('search')
    let cols = dto.columns as string[]
    const typeHash = fromMappingColumnArrayToTypeHash(demarche.mappingColumns)
    cols = cols.filter((col) => !!typeHash[col])
    dto = adjustDto(dto)
    const query = `WITH
      ${this._buildRepeatedCTE(demarche.id, cols)},
      ${this._buildNonRepeatedCTE(demarche.id, cols)},
      ${this._buildCombinedCTE(cols, typeHash)},
      ${this._buildCountedCTE(dto, typeHash)}
      SELECT * FROM countedCTE
      ${complete ? '' : buildPaginationQuery(dto.page || 1, dto.perPage || 5)}
    `
    const result = await this.repo.query(query)

    if (!result[0]) {
      return { total: 0, data: [] }
    }
    return {
      total: parseInt(result[0].total),
      data: result.map((r) => {
        delete r.total
        return r
      }),
    }
  }
}
