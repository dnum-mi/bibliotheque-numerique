import { Injectable } from '@nestjs/common'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { Repository } from 'typeorm'
import { Dossier } from '../objects/entities/dossier.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseEntityService } from '../../../shared/base-entity/base-entity.service'
import { SearchDossierDto } from '../objects/dto/search-dossier.dto';
import { Demarche } from '../../demarches/objects/entities/demarche.entity';
import { Field } from '../objects/entities/field.entity';
import { buildFilterQuery, buildPaginationQuery, buildSortQuery } from './common-search.utils';

@Injectable()
export class FieldSearchService extends BaseEntityService<Field> {
  constructor (
    @InjectRepository(Dossier) protected readonly repo: Repository<Field>,
    protected readonly logger: LoggerService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  private _buildCommonRepeatedCTE(demarcheId: number, fieldsId: string[], repeated: boolean) {
    this.logger.verbose("_buildCommonRepeatedCTE")
    const repeatedLine = repeated ? ',COALESCE(ROW_NUMBER() OVER (PARTITION BY f."dossierId", f."dsFieldId" ORDER BY f."parentRowIndex"), 0) AS maxRowNbr' : ''
    const name = repeated ? 'repeatedCTE' : 'nonRepeatedCTE'
    return `
      ${name} AS (
        SELECT
          f."dossierId",
          f."dsFieldId",
          f."stringValue"
          ${repeatedLine}
        FROM fields f
        INNER JOIN dossiers d ON f."dossierId" = d.id
        WHERE f."parentRowIndex" IS ${repeated? 'NOT ': ''}NULL
        AND f."dsFieldId" IN (${fieldsId.map(id => `'${id}'`).join(',')})
        AND d."demarcheId" = ${demarcheId}
      )
    `
  }

  private _buildRepeatedCTE(demarcheId: number, fieldsId: string[]): string {
    this.logger.verbose("_buildRepeatedCTE")
    return this._buildCommonRepeatedCTE(demarcheId, fieldsId, true)
  }

  private _buildNonRepeatedCTE(demarcheId: number, fieldsId: string[]): string {
    this.logger.verbose("_buildNonRepeatedCTE")
    return this._buildCommonRepeatedCTE(demarcheId, fieldsId, false)
  }

  private _buildCombinedCTE(fieldsId: string[], hash: Record<string,string>): string {
    this.logger.verbose("_buildRepeatedCTE")
    return `
      combinedCTE AS (
        SELECT
            n."dossierId",
            ${
              fieldsId
                .map((id: string) => {
                  const label = hash[id];
                  if (!label) {
                    this.logger.warn(`Field with id ${id} not found in mappedColumns.`);
                    return undefined
                  }
                  return `MAX(COALESCE(CASE WHEN n."dsFieldId" = '${id}' THEN n."stringValue" END, CASE WHEN r."dsFieldId" = '${id}' THEN r."stringValue" END)) AS ${label}`
                })
                .filter(a => !!a)
                .join(',')
            }
        FROM nonRepeatedCTE n
        LEFT JOIN repeatedCTE r ON n."dossierId" = r."dossierId"
        GROUP BY n."dossierId", r.maxRowNbr
      )
    `
  }

  private _buildCountedCTE(dto: SearchDossierDto, hashColumns: Record<string, string>): string {
    this.logger.verbose("_buildRepeatedCTE")
    return `
      countedCTE AS (
        SELECT *, COUNT(*) OVER () AS total
        FROM combinedCTE
        ${buildFilterQuery()}
        ${buildSortQuery(dto.sorts, hashColumns)}
      )
    `
  }

  async search(demarche: Partial<Demarche>, dto: SearchDossierDto): Promise<{ total: number, data: any[] }> {
    this.logger.verbose('search')
    const hashColumns: Record<string, string> = Object.fromEntries(
      demarche.mappingColumns.map((c) => [c.id, c.label]),
    )
    const query = `WITH
      ${this._buildRepeatedCTE(demarche.id, dto.columns)},
      ${this._buildNonRepeatedCTE(demarche.id, dto.columns)},
      ${this._buildCombinedCTE(dto.columns, hashColumns)},
      ${this._buildCountedCTE(dto, hashColumns)}
      SELECT * FROM countedCTE
      ${buildPaginationQuery(dto.page || 1, dto.perPage || 5)}
    `;
    const result = await this.repo.query(query);
    return {
      total: parseInt(result[0].total),
      data: result.map((r) => {
        delete r.total
        return r
      }),
    }
  }
}

