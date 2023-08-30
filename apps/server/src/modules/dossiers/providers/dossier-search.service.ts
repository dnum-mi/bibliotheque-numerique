import { Injectable } from '@nestjs/common'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { Repository } from 'typeorm'
import { Dossier } from '../objects/entities/dossier.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseEntityService } from '../../../shared/base-entity/base-entity.service'
import { Demarche } from '../../demarches/objects/entities/demarche.entity'
import {
  buildFilterQuery,
  buildPaginationQuery,
  buildSortQuery,
  deduceFieldToQueryFromType,
} from './common-search.utils'
import { FieldService } from './field.service'
import { DossierSearchOutputDto, FieldTypeKeys, SearchDossierDto } from '@biblio-num/shared'

@Injectable()
export class DossierSearchService extends BaseEntityService<Dossier> {
  constructor(
    @InjectRepository(Dossier) protected readonly repo: Repository<Dossier>,
    protected readonly logger: LoggerService,
    private readonly fieldService: FieldService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  // as a same field ID can have multiple instance (repetable fields), we need to aggregate them in an array
  private _buildArrayAggregateFromOneFieldId(id: string, type: FieldTypeKeys): string {
    this.logger.verbose('_buildArrayAggregateFromOneFieldId')
    return `
      ARRAY_AGG(
        CASE WHEN f."sourceId" = '${id}' THEN f."${deduceFieldToQueryFromType(type)}" END)
        FILTER (WHERE f."sourceId" = '${id}')
    `
  }

  // build a common table expression to facilitate manipulation of fields
  // where every field is its stringValue (or number or date) in a column of its label.
  private _buildAggregatedCTE(demarcheId: number, typeHash: Record<string, FieldTypeKeys>): string {
    this.logger.verbose('_buildAggregatedCTE')
    const fieldsId = Object.keys(typeHash)
    const select = fieldsId
      .map((id: string) => `${this._buildArrayAggregateFromOneFieldId(id, typeHash[id])} as "${id}"`)
      .join(',')
    return `
      aggregatedCTE AS (
        SELECT
            d.id as dossier_id,
            ${select}
        FROM dossiers d
        JOIN fields f ON d.id = f."dossierId"
        WHERE d."demarcheId" = ${demarcheId}
        GROUP BY d.id
      )
   `
  }

  // count the number of row before pagination
  private _buildCountCTE(typeHash: Record<string, FieldTypeKeys>): string {
    this.logger.verbose('_buildCountCTE')
    return `
      countCTE AS (
        SELECT COUNT(*) as nbrRows
        FROM aggregatedCTE
        ${buildFilterQuery(typeHash)}
      )
   `
  }

  async search(demarche: Partial<Demarche>, dto: SearchDossierDto): Promise<DossierSearchOutputDto> {
    this.logger.verbose('search')
    const typeHash = await this.fieldService.giveFieldType(dto.columns)
    const query = `WITH
      ${this._buildAggregatedCTE(demarche.id, typeHash)},
      ${this._buildCountCTE(typeHash)}
      SELECT *, (SELECT nbrRows FROM countCTE) as total
      FROM aggregatedCTE
      ${buildFilterQuery(typeHash)}
      ${buildSortQuery(dto.sorts)}
      ${buildPaginationQuery(dto.page || 1, dto.perPage || 5)}
    `
    const result = await this.repo.query(query)
    return {
      total: parseInt(result[0].total),
      data: result.map((r) => {
        delete r.total
        Object.keys(r).forEach((key: string) => {
          if (r[key] instanceof Array && r[key].length === 1) {
            r[key] = r[key][0]
          }
        })
        return r
      }),
    }
  }
}
