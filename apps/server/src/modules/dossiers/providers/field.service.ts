import { Injectable } from '@nestjs/common'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { Field } from '../objects/entities/field.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Dossier as TDossier } from '@dnum-mi/ds-api-client/dist/@types/types'
import {
  DsChampType,
  DsChampTypeKeys,
} from '@/shared/modules/ds-api/objects/ds-champ-type.enum'
import { CreateFieldDto } from '../objects/dto/fields/create-field.dto'
import { fixFieldValueFunctions } from '../objects/constante/fix-field.dictionnary'
import {
  FieldType,
  FieldTypeKeys,
  FormatFunctionRef,
  FormatFunctionRefKeys,
  MappingColumn,
  PrefectureKeys,
} from '@biblio-num/shared'
import { RawChamp } from '@/shared/types/raw-champ.type'
import { PieceJustificativeChamp } from '@dnum-mi/ds-api-client'

export type TDossierWithPrefecture = Partial<TDossier> & {
  prefecture?: PrefectureKeys
}

@Injectable()
export class FieldService extends BaseEntityService<Field> {
  constructor(
    @InjectRepository(Field) protected repo: Repository<Field>,
    protected logger: LoggerService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  static giveString(champ: RawChamp): string {
    if (champ.__typename === DsChampType.PieceJustificativeChamp) {
      return (champ as unknown as PieceJustificativeChamp).file?.url ?? ''
    } else {
      return champ.stringValue
    }
  }

  static giveNumberOrNull(
    type: FieldTypeKeys,
    stringValue: string,
  ): number | null {
    const number = type === FieldType.number ? parseFloat(stringValue) : null
    return number && !isNaN(number) ? number : null
  }

  static giveDateOrNull(type: FieldTypeKeys, stringValue: string): Date | null {
    const date =
      type === FieldType.date && stringValue.length
        ? new Date(stringValue)
        : null
    return date && !isNaN(date.getTime()) ? date : null
  }

  private _extractColumnRefFieldInformation(
    columnRef: MappingColumn,
  ): Pick<
    CreateFieldDto,
    'sourceId' | 'label' | 'formatFunctionRef' | 'type' | 'fieldSource'
  > {
    this.logger.verbose('_extractColumnRefFieldInformation')
    return {
      sourceId: columnRef.id,
      label: columnRef.originalLabel,
      formatFunctionRef: columnRef.formatFunctionRef,
      type: columnRef.type,
      fieldSource: columnRef.source,
    }
  }

  private _extractDsChampType(
    champ: RawChamp,
    formatFunctionRefKey?: FormatFunctionRefKeys | null,
  ): DsChampTypeKeys {
    const originalDsChampType: DsChampTypeKeys =
      DsChampType[champ.__typename] ?? DsChampType.UnknownChamp
    if (formatFunctionRefKey === FormatFunctionRef.rna) {
      return DsChampType.RnaChamp
    } else if (formatFunctionRefKey === FormatFunctionRef.rnf) {
      return DsChampType.RnfChamp
    }
    return originalDsChampType
  }

  private _createFieldsFromRawChamps(
    champs: Array<RawChamp>,
    dossierId: number,
    columnHash: Record<string, MappingColumn>,
    parentRow: number = null,
  ): CreateFieldDto[] {
    this.logger.verbose('_createFieldsFromRawChamps')
    this.logger.debug(`parentRow: ${parentRow}`)
    if (!champs.length) return []
    const fields: CreateFieldDto[] = []
    champs.forEach((champ) => {
      this.logger.debug(`champ: ${JSON.stringify(champ.label)}`)
      if (!champ.__typename || !champ.id || !champ.label) {
        this.logger.warn(`champ is not valid: ${JSON.stringify(champ)}`)
      } else {
        const id = champ.champDescriptor?.id ?? champ.id
        const columnRef = columnHash[id]
        const dsType = this._extractDsChampType(
          champ,
          columnRef.formatFunctionRef,
        )
        if (!columnRef) {
          this.logger.debug(champ)
          throw new Error(`There is no reference of ${id} in column hash`)
        }
        fields.push({
          ...this._extractColumnRefFieldInformation(columnRef),
          stringValue: FieldService.giveString(champ),
          dateValue: FieldService.giveDateOrNull(
            columnRef.type,
            champ.stringValue,
          ),
          numberValue: FieldService.giveNumberOrNull(
            columnRef.type,
            champ.stringValue,
          ),
          dsChampType: dsType,
          dossierId,
          parentRowIndex: parentRow,
          rawJson: champ,
          children:
            champ.__typename === DsChampType.RepetitionChamp
              ? champ.rows?.length
                ? champ.rows
                  .map((row, i: number) => {
                    return this._createFieldsFromRawChamps(
                      row.champs,
                      dossierId,
                      columnHash,
                      i,
                    )
                  })
                  .flat()
                : []
              : null,
        } as CreateFieldDto)
      }
    })
    return fields
  }

  private _createFieldsFromFixFields(
    dossierId: number,
    columnHash: Record<string, MappingColumn>,
    dataJson?: TDossierWithPrefecture,
  ): CreateFieldDto[] {
    this.logger.verbose('_createFieldsFromFixFields')
    return Object.keys(fixFieldValueFunctions).map((fixFieldId) => {
      const value: string =
        fixFieldValueFunctions[fixFieldId](dataJson)?.toString() ?? ''
      return {
        ...this._extractColumnRefFieldInformation(columnHash[fixFieldId]),
        stringValue: value.toString(),
        dateValue: FieldService.giveDateOrNull(
          columnHash[fixFieldId].type,
          value,
        ),
        numberValue: FieldService.giveNumberOrNull(
          columnHash[fixFieldId].type,
          value,
        ),
        dossierId,
        parentRowIndex: null,
        rawJson: null,
        dsChampType: null,
      }
    })
  }

  private _createFieldsFromDataJson(
    dataJson: TDossierWithPrefecture,
    dossierId: number,
    columnHash: Record<string, MappingColumn>,
  ): CreateFieldDto[] {
    this.logger.verbose('_createFieldsFromDataJson')
    const champs = dataJson?.champs ?? []
    const annotations = dataJson?.annotations ?? []
    return [
      ...this._createFieldsFromFixFields(dossierId, columnHash, dataJson),
      ...this._createFieldsFromRawChamps(
        champs as RawChamp[],
        dossierId,
        columnHash,
      ),
      ...this._createFieldsFromRawChamps(
        annotations as RawChamp[],
        dossierId,
        columnHash,
      ),
    ]
  }

  async overwriteFieldsFromDataJson(
    dataJson: TDossierWithPrefecture,
    dossierId: number,
    mappingColumns: MappingColumn[],
  ): Promise<Field[]> {
    this.logger.verbose('createFieldsFromDataJsonWithTransaction')
    const columnHash: Record<string, MappingColumn> = Object.fromEntries(
      mappingColumns
        .map((mc: MappingColumn) => [
          [mc.id, mc],
          ...(mc.children?.length ? mc.children.map((c) => [c.id, c]) : []),
        ])
        .flat(1),
    )
    const fields = this._createFieldsFromDataJson(
      dataJson,
      dossierId,
      columnHash,
    )
    await this.repo.delete({ dossierId })
    // TODO: supprimer les fichiers S3
    return this.repo.save(fields)
  }

  async giveFieldType(
    fieldsId: string[],
  ): Promise<Record<string, FieldTypeKeys>> {
    this.logger.verbose('giveFieldType')
    return await this._queryGiveFieldType(fieldsId).then((result) => {
      return Object.fromEntries(
        result.map((r: { sourceId: string; type: FieldTypeKeys }) => [
          r.sourceId,
          r.type,
        ]),
      )
    })
  }

  private async _queryGiveFieldType(fieldsId: string[]): Promise<
    {
      sourceId: string
      type: FieldTypeKeys
    }[]
  > {
    return this.repo
      .createQueryBuilder()
      .select('"sourceId"')
      .distinct(true)
      .addSelect('type')
      .where('"sourceId" IN (:...sourceids)', {
        sourceids: fieldsId.map((id) => id),
      })
      .getRawMany()
  }

  async upsert(
    field: Pick<Field, 'sourceId' | 'dossierId'> & Partial<Field>,
  ): Promise<Field[]> {
    const result = await this.repo.upsert(field, {
      conflictPaths: ['sourceId', 'dossierId', 'parentRowIndex'],
      skipUpdateIfNoValuesChanged: true,
    })
    return result.generatedMaps as Field[]
  }
}
