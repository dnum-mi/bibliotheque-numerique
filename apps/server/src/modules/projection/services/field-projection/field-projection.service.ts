import { Injectable } from '@nestjs/common'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { FieldTypeKeys } from '@biblio-num/shared'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { DataSource } from 'typeorm'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'
import { fromMappingColumnArrayToTypeHash } from '@/modules/demarches/utils/demarche.utils'
import { deduceFieldToQueryFromType } from '@/shared/pagination/utils/common-search.utils'
import { ProjectionManagerService } from '@/modules/projection/services/projection-manager/projection-manager.service'
import { mapFieldTypeToSql } from '@/modules/projection/utils/projection-utils'

type tProjectionCol = {
  id: string
  type: string
}

@Injectable()
export class FieldProjectionService {
  constructor(
    private logger: LoggerService,
    private readonly dataSource: DataSource,
  ) {}

  //#region 📍------ Create table ------ 📍
  async createTable(demarche: Demarche, tableName?: string): Promise<void> {
    this.logger.verbose(`createTable ${demarche.title}`)
    tableName = tableName || ProjectionManagerService.buildFieldTableName(demarche.id)

    const typeHash = fromMappingColumnArrayToTypeHash(
      demarche.mappingColumns.filter(c => !c.isHeader),
    )

    const columnDefinitions = Object.entries(typeHash)
      .map(([id, type]) => {
        const sqlType = mapFieldTypeToSql(type)
        return `"${id}" ${sqlType}`
      })
      .join(',\n')

    const query = `
      DROP TABLE IF EXISTS "${tableName}";

      CREATE TABLE "${tableName}"
      (
        "dossierId"           integer NOT NULL,
        projectionRowIndex integer NOT NULL,
        ${columnDefinitions},
        PRIMARY KEY ("dossierId", projectionRowIndex)
      );
    `

    this.logger.debug(query)

    await this.dataSource.query(query)
  }
  //#endregion

  //#region 📍------ Legacy search field pre-request ------ 📍
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
  //#endregion

  async rebuild(demarche: Demarche): Promise<void> {
    this.logger.verbose(`rebuild projection ${demarche.title}`)

    const baseTableName =
      ProjectionManagerService.buildFieldTableName(demarche.id)

    const tempTableName = `${baseTableName}__tmp`
    const backupTableName = `${baseTableName}__old`

    // clean possible old remaining
    await this.dataSource.query(`
        DROP TABLE IF EXISTS "${tempTableName}";
        DROP TABLE IF EXISTS "${backupTableName}";
    `)

    // new table under temp name
    await this.createTable(demarche, tempTableName)

    const typeHash = fromMappingColumnArrayToTypeHash(
      demarche.mappingColumns.filter(c => !c.isHeader),
    )

    const fieldsId = Object.keys(typeHash)

    // original query from field search
    const buildQuery = `
      WITH
        ${this._buildRepeatedCTE(demarche.id, fieldsId)},
        ${this._buildNonRepeatedCTE(demarche.id, fieldsId)},
        ${this._buildCombinedCTE(fieldsId, typeHash)},
        numbered AS (
          SELECT *,
                 ROW_NUMBER() OVER (
                   PARTITION BY "dossierId"
                   ORDER BY "dossierId"
                 ) AS projectionRowIndex
          FROM combinedCTE
        )
      INSERT INTO "${tempTableName}" (
        "dossierId",
        projectionRowIndex,
        ${fieldsId.map((id) => `"${id}"`).join(',')}
      )
      SELECT
        "dossierId",
        projectionRowIndex,
        ${fieldsId.map((id) => `"${id}"`).join(',')}
      FROM numbered
    `

    await this.dataSource.query(buildQuery)

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

    this.logger.log(`Projection rebuilt safely for demarche ${demarche.id}`)
  }

  async upsertOneDossier(demarche: Demarche, dossierId: number): Promise<void> {
    this.logger.verbose(
      `upsertOneDossier projection ${demarche.title} - dossier ${dossierId}`,
    )

    const tableName = ProjectionManagerService.buildFieldTableName(demarche.id)

    const typeHash = fromMappingColumnArrayToTypeHash(
      demarche.mappingColumns.filter(c => !c.isHeader),
    )

    const fieldsId = Object.keys(typeHash)

    if (!fieldsId.length) return

    // On supprime les anciennes lignes de projection du dossier
    await this.dataSource.query(
      `DELETE FROM "${tableName}" WHERE "dossierId" = $1`,
      [dossierId],
    )

    // query d'injection pour ce dossier
    const query = `
        WITH
          ${this._buildRepeatedCTE(demarche.id, fieldsId)},
          ${this._buildNonRepeatedCTE(demarche.id, fieldsId)},
          ${this._buildCombinedCTE(fieldsId, typeHash)},
          numbered AS (
            SELECT
              *,
              ROW_NUMBER() OVER (
                PARTITION BY "dossierId"
              ) AS projectionRowIndex
            FROM combinedCTE
          )

        INSERT INTO "${tableName}" (
          dossierId,
          projectionRowIndex,
          ${fieldsId.map((id) => `"${id}"`).join(',')}
        )
        SELECT
          "dossierId",
          projectionRowIndex,
          ${fieldsId.map((id) => `"${id}"`).join(',')}
        FROM numbered
        WHERE "dossierId" = $1
    `

    await this.dataSource.query(query, [dossierId])

    this.logger.log(`Projection upserted for dossier ${dossierId}`)
  }
}
