import { Injectable } from '@nestjs/common'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { Repository } from 'typeorm'
import { Dossier } from '../objects/entities/dossier.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseEntityService } from '../../../shared/base-entity/base-entity.service'
import { SearchDossierDto } from '../objects/dto/search-dossier.dto';
import { Demarche } from '../../demarches/objects/entities/demarche.entity';
import { buildFilterQuery, buildPaginationQuery, buildSortQuery } from './common-search.utils';

@Injectable()
export class DossierSearchService extends BaseEntityService<Dossier> {
  constructor (
    @InjectRepository(Dossier) protected readonly repo: Repository<Dossier>,
    protected readonly logger: LoggerService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  // as a same field ID can have multiple instance (repetable fields), we need to aggregate them in an array
  private _buildArrayAggregateFromOneFieldId(id: string): string {
    this.logger.verbose("_buildArrayAggregateFromOneFieldId");
    return `ARRAY_AGG(CASE WHEN f."dsFieldId" = '${id}' THEN f."stringValue" END) FILTER (WHERE f."dsFieldId" = '${id}')`
  }

  // count the number of row before pagination
  private _buildCountCTE(demarcheId: number): string {
    this.logger.verbose("_buildCountCTE")
    return `
      countCTE AS (
        SELECT COUNT(*) as nbrRows
        FROM (
            SELECT d.id
            FROM dossiers d
            JOIN fields f ON d.id = f."dossierId"
            WHERE d."demarcheId" = ${demarcheId}
            GROUP BY d.id
            ${buildFilterQuery()}
        ) sub
      )
   `
  }

  // build a common table expression to facilitate manipulation of fields where every field is its stringValue in a column of its label.
  private _buildMainCTE(demarcheId: number, hashColumns: Record<string, string>, fieldsId: string[]) : string {
    this.logger.verbose("_buildMainCTE")
    return `
      mainCTE AS (
        SELECT
            d.id as dossier_id,
            ${
               fieldsId
                 .map((id: string) => {
                   const label = hashColumns[id];
                   if (!label) {
                     this.logger.warn(`Field with id ${id} not found in mappedColumns.`);
                     return undefined
                   }
                   // use array aggregate for field that have multiple instance (repetable fields)
                   return `${this._buildArrayAggregateFromOneFieldId(id)} as ${label}`
                 })
                 .filter(a => !!a)
                 .join(',')
            }
        FROM dossiers d
        JOIN fields f ON d.id = f."dossierId"
        WHERE d."demarcheId" = ${demarcheId}
        GROUP BY d.id
      )
   `
  }

  async search(demarche: Partial<Demarche>, dto: SearchDossierDto): Promise<{ total: number, data: any[] }> {
    this.logger.verbose('search')
    const hashColumns: Record<string, string> = Object.fromEntries(
      demarche.mappingColumns.map((c) => [c.id, c.label]),
    )
    const query = `WITH
      ${this._buildCountCTE(demarche.id)},
      ${this._buildMainCTE(demarche.id, hashColumns, dto.columns)}
      SELECT *, (SELECT nbrRows FROM countCTE) as total
      FROM mainCTE
      ${buildFilterQuery()}
      ${buildSortQuery(dto.sorts, hashColumns)}
      ${buildPaginationQuery(dto.page || 1, dto.perPage || 5)}
    `
    const result = await this.repo.query(query);
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

