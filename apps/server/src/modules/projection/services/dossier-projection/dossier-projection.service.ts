import { Injectable } from '@nestjs/common'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { ProjectionManagerService } from '@/modules/projection/services/projection-manager/projection-manager.service'
import { fromMappingColumnArrayToTypeHash } from '@/modules/demarches/utils/demarche.utils'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { mapFieldTypeToSql } from '@/modules/projection/utils/projection-utils'
import { DataSource } from 'typeorm'
import { deduceFieldToQueryFromType } from '@/shared/pagination/utils/common-search.utils'
import { FieldTypeKeys } from '@biblio-num/shared'

@Injectable()
export class DossierProjectionService {
  constructor(
    private readonly logger: LoggerService,
    private dataSource: DataSource,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  //#region 📍------ Create table ------ 📍
  async createTable(demarche: Demarche): Promise<void> {
    this.logger.verbose(`createTable dossier pojection for ${demarche.title}`)

    const tableName = ProjectionManagerService.buildDossierTableName(demarche.id)

    const typeHash = fromMappingColumnArrayToTypeHash(
      demarche.mappingColumns,
    )

    const columnDefinitions = Object.entries(typeHash)
      .map(([id, type]) => {
        const sqlType = mapFieldTypeToSql(type)
        return `"${id}" ${sqlType}[]`
      })
      .join(',\n')

    const query = `
        DROP TABLE IF EXISTS "${tableName}";

        CREATE TABLE "${tableName}" (
          "dossierId" bigint PRIMARY KEY,
          ${columnDefinitions}
        );
    `

    await this.dataSource.query(query)
  }
  //#endregion

  //#region 📍------ Legacy search dossier pre-request ------ 📍
  // as a same field ID can have multiple instance (repetable fields), we need to aggregate them in an array
  private _buildArrayAggregateFromOneFieldId(
    id: string,
    type: FieldTypeKeys,
  ): string {
    return `
      ARRAY_AGG(
        CASE WHEN f."sourceId" = '${id}' THEN f."${deduceFieldToQueryFromType(type)}" END)
        FILTER (WHERE f."sourceId" = '${id}')
    `
  }

  // build a common table expression to facilitate manipulation of fields
  // where every field is its stringValue (or number or date) in a column of its label.
  private _buildAggregatedCTE(
    demarcheId: number,
    typeHash: Record<string, FieldTypeKeys>,
  ): string {
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
  //#endregion

  async rebuild(demarche: Demarche): Promise<void> {
    this.logger.verbose(`rebuild dossier projection ${demarche.title}`)
    const tableName = ProjectionManagerService.buildDossierTableName(demarche.id)
    await this.createTable(demarche)

    const typeHash = fromMappingColumnArrayToTypeHash(
      demarche.mappingColumns,
    )

    const fieldsId = Object.keys(typeHash)

    if (!fieldsId.length) {
      this.logger.warn('No mapping columns found')
      return
    }

    const query = `
      WITH
        ${this._buildAggregatedCTE(demarche.id, typeHash)}

      INSERT INTO "${tableName}" (
        "dossierId",
        ${fieldsId.map((id) => `"${id}"`).join(',')}
      )
      SELECT
        "dossierId",
        ${fieldsId.map((id) => `"${id}"`).join(',')}
      FROM aggregatedCTE
    `

    await this.dataSource.query(query)

    this.logger.log(
      `Dossier projection rebuilt for demarche ${demarche.id}`,
    )
  }

  async upsertOneDossier(
    demarche: Demarche,
    dossierId: number,
  ): Promise<void> {
    this.logger.verbose(
      `upsertOneDossier dossier projection ${demarche.title} - dossier ${dossierId}`,
    )

    const tableName =
      ProjectionManagerService.buildDossierTableName(demarche.id)

    const typeHash = fromMappingColumnArrayToTypeHash(
      demarche.mappingColumns,
    )

    const fieldsId = Object.keys(typeHash)

    if (!fieldsId.length) {
      this.logger.warn('No mapping columns found')
      return
    }

    await this.dataSource.query(`DELETE FROM "${tableName}" WHERE "dossierId" = $1`, [dossierId])

    const aggregatedCTE = `
      aggregatedCTE AS (
        SELECT
          d.id as "dossierId",
          ${fieldsId.map((id: string) => `
            ${this._buildArrayAggregateFromOneFieldId(id, typeHash[id])} as "${id}"
          `).join(',')}
        FROM dossiers d
        JOIN fields f ON d.id = f."dossierId"
        WHERE d."demarcheId" = ${demarche.id}
          AND d.id = $1
        GROUP BY d.id
      )
    `

    const query = `
      WITH
        ${aggregatedCTE}
      INSERT INTO "${tableName}" (
        "dossierId",
        ${fieldsId.map((id) => `"${id}"`).join(',')}
      )
      SELECT
        "dossierId",
        ${fieldsId.map((id) => `"${id}"`).join(',')}
      FROM aggregatedCTE
    `

    await this.dataSource.query(query, [dossierId])

    this.logger.log(
      `Dossier ${dossierId} inserted into dossier projection`,
    )
  }
}
