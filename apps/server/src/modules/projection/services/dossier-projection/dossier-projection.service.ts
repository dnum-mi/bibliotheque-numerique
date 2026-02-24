import { Injectable } from '@nestjs/common'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { ProjectionManagerService } from '@/modules/projection/services/projection-manager/projection-manager.service'
import {
  flattenWithoutHeader,
} from '@/modules/demarches/utils/demarche.utils'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { mapFieldTypeToSql } from '@/modules/projection/utils/projection-utils'
import { DataSource } from 'typeorm'
import { deduceFieldToQueryFromType } from '@/shared/pagination/utils/common-search.utils'
import { FieldTypeKeys } from '@biblio-num/shared'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'

@Injectable()
export class DossierProjectionService {
  constructor(
    private readonly logger: LoggerService,
    private dataSource: DataSource,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  //#region 📍------ Create table ------ 📍
  async createTable(demarche: Demarche, tableName?: string): Promise<void> {
    this.logger.verbose(`createTable dossier pojection for ${demarche.title}`)

    tableName = tableName || ProjectionManagerService.buildDossierTableName(demarche.id)

    const columnDefinitions = flattenWithoutHeader(demarche.mappingColumns)
      .map((c) => {
        const sqlType = mapFieldTypeToSql(c.type)
        return `"${c.id}" ${sqlType}[]`
      })
      .join(',\n')

    const query = `
        DROP TABLE IF EXISTS "${tableName}";

        CREATE TABLE "${tableName}" (
          "dossierId" integer PRIMARY KEY,
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
    mappingColumns: MappingColumn[],
  ): string {
    this.logger.verbose('_buildAggregatedCTE')

    const select = mappingColumns
      .map((c) => `${this._buildArrayAggregateFromOneFieldId(c.id, c.type)} as "${c.id}"`)
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
    const baseTableName = ProjectionManagerService.buildDossierTableName(demarche.id)

    const tempTableName = `${baseTableName}__tmp`
    const backupTableName = `${baseTableName}__old`

    // clean possible old remaining
    await this.dataSource.query(`
        DROP TABLE IF EXISTS "${tempTableName}";
        DROP TABLE IF EXISTS "${backupTableName}";
    `)

    await this.createTable(demarche, tempTableName)

    const fields = flattenWithoutHeader(demarche.mappingColumns)

    if (!fields.length) {
      this.logger.warn('No mapping columns found')
      return
    }

    // original query from old dossier search query
    const query = `
      WITH
        ${this._buildAggregatedCTE(demarche.id, fields)}

      INSERT INTO "${tempTableName}" (
        "dossierId",
        ${fields.map((c) => `"${c.id}"`).join(',')}
      )
      SELECT
        "dossierId",
        ${fields.map((c) => `"${c.id}"`).join(',')}
      FROM aggregatedCTE
    `

    await this.dataSource.query(query)

    // Swap atomique
    await this.dataSource.query(`
      BEGIN;

      ALTER TABLE IF EXISTS "${baseTableName}"
        RENAME TO "${backupTableName}";

      ALTER TABLE "${tempTableName}"
        RENAME TO "${baseTableName}";

      DROP TABLE IF EXISTS "${backupTableName}";

      COMMIT;
    `)

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

    const tableName = ProjectionManagerService.buildDossierTableName(demarche.id)
    const columns = flattenWithoutHeader(demarche.mappingColumns)

    if (!columns.length) {
      this.logger.warn('No mapping columns found')
      return
    }

    await this.dataSource.query(`DELETE FROM "${tableName}" WHERE "dossierId" = $1`, [dossierId])

    const aggregatedCTE = `
      aggregatedCTE AS (
        SELECT
          d.id as "dossierId",
          ${columns.map((c: MappingColumn) => `
            ${this._buildArrayAggregateFromOneFieldId(c.id, c.type)} as "${c.id}"
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
        ${columns.map((c) => `"${c.id}"`).join(',')}
      )
      SELECT
        "dossierId",
        ${columns.map((c) => `"${c.id}"`).join(',')}
      FROM aggregatedCTE
    `

    await this.dataSource.query(query, [dossierId])

    this.logger.log(
      `Dossier ${dossierId} inserted into dossier projection`,
    )
  }
}
