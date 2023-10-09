import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Repository } from 'typeorm'
import { Dossier } from '../objects/entities/dossier.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { Demarche } from '../../demarches/objects/entities/demarche.entity'
import {
  adjustDto,
  buildFilterQueryWithWhere,
  buildPaginationQuery,
  buildSortQuery,
  deduceFieldToQueryFromType,
  buildOneFilter,
} from '@/shared/utils/common-search.utils'
import { FieldService } from './field.service'
import {
  DossierSearchOutputDto,
  FieldTypeKeys,
  FilterDto,
  MappingColumn,
  SearchDossierDto,
} from '@biblio-num/shared'
import { Field } from '../objects/entities/field.entity'
import { IStatistique } from '../objects/dto/statistique/statistique.interface'
import { CustomFilter } from '../../custom-filters/objects/entities/custom-filter.entity'
import { fromMappingColumnArrayToTypeHash } from '../../demarches/utils/demarche.utils'

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
            d.id as "dossierId",
            ${select}
        FROM dossiers d
        JOIN fields f ON d.id = f."dossierId"
        WHERE d."demarcheId" = ${demarcheId}
        GROUP BY d.id
      )
   `
  }

  // count the number of row before pagination
  private _buildCountCTE(filters: Record<string, FilterDto>, typeHash: Record<string, FieldTypeKeys>): string {
    this.logger.verbose('_buildCountCTE')
    return `
      countCTE AS (
        SELECT COUNT(*) as nbrRows
        FROM aggregatedCTE
        ${buildFilterQueryWithWhere(filters, typeHash, true)}
      )
   `
  }

  async search(demarche: Partial<Demarche>, dto: SearchDossierDto, complete = false): Promise<DossierSearchOutputDto> {
    this.logger.verbose('search')
    const typeHash = await this.fieldService.giveFieldType(dto.columns)
    dto = adjustDto(dto)
    const query = `WITH
      ${this._buildAggregatedCTE(demarche.id, typeHash)},
      ${this._buildCountCTE(dto.filters, typeHash)}
      SELECT *, (SELECT nbrRows FROM countCTE) as total
      FROM aggregatedCTE
      ${buildFilterQueryWithWhere(dto.filters, typeHash, true)}
      ${buildSortQuery(dto.sorts)}
      ${complete ? '' : buildPaginationQuery(dto.page || 1, dto.perPage || 5)}
    `
    const result = await this.repo.query(query)
    if (!result?.[0]) {
      return { total: 0, data: [] }
    }
    const withoutChildrenIds: string[] = demarche.mappingColumns
      .filter((c: MappingColumn) => !c.children?.length)
      .map(c => c.id)
    return {
      total: parseInt(result[0].total),
      data: result.map((r) => {
        delete r.total
        Object.keys(r).forEach((key: string) => {
          if (withoutChildrenIds.includes(key)) {
            r[key] = r[key]?.[0] || null
          }
        })
        return r
      }),
    }
  }

  async statistics(demarche: Demarche, customFilter:CustomFilter): Promise<IStatistique> {
    this.logger.verbose('statistics')
    const { filters } = customFilter
    const { mappingColumns } = demarche

    console.log(mappingColumns)

    const query = this.repo.createQueryBuilder('d')
      .select('d.id')
      .distinct(true)
      .innerJoin(Field, 'f', 'f.dossierId = d.id')

    if (filters) {
      const mch = fromMappingColumnArrayToTypeHash(mappingColumns)

      // TODO: le filtre de date 'in range', check de la format de date
      Object.entries(filters)
        .forEach(([key, filter], idx) => {
          const aliasTable = `t${idx}`
          const commonWhere = `t${idx}."dossierId" = d.id`
          const typeWhere = `t${idx}."sourceId" = '${key}'`
          const fieldName = deduceFieldToQueryFromType(mch[key])
          const customWhere = buildOneFilter(fieldName, filter, mch[key], false, aliasTable)
          query.innerJoin(
            Field,
            aliasTable,
            `${commonWhere} AND ${typeWhere} AND (${customWhere})`)
        })
    }

    query.where('d.demarcheId = :demarcheId', { demarcheId: demarche.id })
    return await query.getCount().then(c => ({ nb: c }))
  }
}
