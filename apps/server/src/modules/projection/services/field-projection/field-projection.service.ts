import { Injectable } from '@nestjs/common'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { FieldType, FieldTypeKeys } from '@biblio-num/shared'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { DataSource } from 'typeorm'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'
import { fromMappingColumnArrayToTypeHash } from '@/modules/demarches/utils/demarche.utils'
import { deduceFieldToQueryFromType } from '@/shared/pagination/utils/common-search.utils'

type tProjectionCol = {
  id: string
  type: string
}

@Injectable()
export class FieldProjectionService {
  static buildTableName(demarcheId: number): string {
    return `projection-fields-${demarcheId}`
  }

  constructor(
    private logger: LoggerService,
    private readonly dataSource: DataSource,
  ) {}

  //#region 📍------ CREATE TABLE ------ 📍
  private _mapFieldTypeToSql(type: FieldTypeKeys): string {
    switch (type) {
    case FieldType.string:
    case FieldType.enum:
    case FieldType.boolean:
    case FieldType.file:
      return 'text'
    case FieldType.number:
    case FieldType.numbers:
      return 'numeric'
    case FieldType.date:
      return 'timestamp'
    default:
      throw new Error(`Unsupported field type: ${type}`)
    }
  }

  private _flattenMappingColumns(cols: MappingColumn[]): tProjectionCol[] {
    this.logger.verbose(`_flattenMappingColumns (${cols.length} columns)`)
    const result: tProjectionCol[] = []

    const traverse = (columns: MappingColumn[]): void => {
      for (const col of columns) {
        if (col.isHeader) continue
        if (!col.type) continue

        if (col.children?.length) {
          traverse(col.children)
        } else {
          result.push({
            id: col.id,
            type: this._mapFieldTypeToSql(col.type),
          })
        }
      }
    }

    traverse(cols)

    return result
  }

  async createTable(demarche: Demarche): Promise<void> {
    this.logger.verbose(`createTable ${demarche.title}`)
    const tableName = FieldProjectionService.buildTableName(demarche.id)

    const flatColumns: tProjectionCol[] = this._flattenMappingColumns(
      demarche.mappingColumns,
    )

    if (!flatColumns?.length) {
      throw new Error('No valid mapping columns found')
    }

    const columnDefinitions: string = flatColumns
      .map((col: tProjectionCol) => `"${col.id}" ${col.type}`)
      .join(',\n')

    const query = `
      DROP TABLE IF EXISTS "${tableName}";

      CREATE TABLE "${tableName}"
      (
        dossierId           bigint  NOT NULL,
        projectionRowIndex integer NOT NULL,
        ${columnDefinitions},
        PRIMARY KEY (dossierId, projectionRowIndex)
      );
    `

    await this.dataSource.query(query)
  }

  //#endregion

  //#region 📍------ FILL TABLE ------ 📍
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

  async rebuild(demarche: Demarche): Promise<void> {
    this.logger.verbose(`rebuild projection ${demarche.title}`)
    await this.createTable(demarche)

    const tableName = FieldProjectionService.buildTableName(demarche.id)
    const flatColumns = this._flattenMappingColumns(demarche.mappingColumns)

    const fieldsId = flatColumns.map(c => c.id)

    const typeHash = fromMappingColumnArrayToTypeHash(demarche.mappingColumns)

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
                ORDER BY "dossierId"
              ) AS projectionRowIndex
            FROM combinedCTE
          )

        INSERT INTO "${tableName}" (
          dossierId,
          projectionRowIndex,
          ${fieldsId.map(id => `"${id}"`).join(',')}
        )
        SELECT
          "dossierId",
          projectionRowIndex,
          ${fieldsId.map(id => `"${id}"`).join(',')}
        FROM numbered
    `

    await this.dataSource.query(query)
  }

  async upsertOneDossier(
    demarche: Demarche,
    dossierId: number,
  ): Promise<void> {
    this.logger.verbose(
      `upsertOneDossier projection ${demarche.title} - dossier ${dossierId}`,
    )

    const tableName = FieldProjectionService.buildTableName(demarche.id)

    const flatColumns = this._flattenMappingColumns(demarche.mappingColumns)
    const fieldsId = flatColumns.map((c) => c.id)

    if (!fieldsId.length) return

    const typeHash = fromMappingColumnArrayToTypeHash(
      demarche.mappingColumns,
    )

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

    this.logger.log(
      `Projection upserted for dossier ${dossierId}`,
    )
  }
  //#endregion
}
