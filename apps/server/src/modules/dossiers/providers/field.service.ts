import { Injectable } from '@nestjs/common'
import { BaseEntityService } from '../../../shared/base-entity/base-entity.service'
import { Field } from '../objects/entities/field.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { Dossier as TDossier } from '@dnum-mi/ds-api-client/dist/@types/types'
import { DsChampType } from '../../../shared/modules/ds-api/objects/ds-champ-type.enum'
import { CreateFieldDto } from '../objects/dto/fields/create-field.dto'
import { CustomChamp } from '@dnum-mi/ds-api-client/src/@types/types'
import { fixFieldValueFunctions } from '../objects/constante/fix-field.dictionnary'
import { FieldType, FieldTypeKeys, MappingColumn } from '@biblio-num/shared'

type RawChamp = CustomChamp & {
  __typename: string;
  rows: Array<{ champs: Array<RawChamp> }>;
};

@Injectable()
export class FieldService extends BaseEntityService<Field> {
  constructor (
    @InjectRepository(Field) protected repo: Repository<Field>,
    protected logger: LoggerService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  static giveNumberOrNull(type: FieldTypeKeys, stringValue: string): number | null {
    const number = type === FieldType.number ? parseFloat(stringValue) : null
    return number && !isNaN(number) ? number : null
  }

  static giveDateOrNull(type: FieldTypeKeys, stringValue: string): Date | null {
    const date = type === FieldType.date && stringValue.length ? new Date(stringValue) : null
    return date && !isNaN(date.getTime()) ? date : null
  }

  private _extractColumnRefFieldInformation (
    columnRef: MappingColumn,
  ): Pick<CreateFieldDto, 'sourceId' | 'label' | 'formatFunctionRef' | 'type' | 'fieldSource'> {
    this.logger.verbose('_extractColumnRefFieldInformation')
    return {
      sourceId: columnRef.id,
      label: columnRef.originalLabel,
      formatFunctionRef: columnRef.formatFunctionRef,
      type: columnRef.type,
      fieldSource: columnRef.source,
    }
  }

  private _createFieldsFromRawChamps (
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
        const dsType = DsChampType[champ.__typename] ?? DsChampType.UnknownChamp
        const id = champ.champDescriptor?.id ?? champ.id
        const columnRef = columnHash[id]
        if (!columnRef) {
          this.logger.debug(champ)
          throw new Error(`There is no reference of ${id} in column hash`)
        }
        fields.push({
          ...this._extractColumnRefFieldInformation(columnRef),
          stringValue: champ.stringValue,
          dateValue: FieldService.giveDateOrNull(columnRef.type, champ.stringValue),
          numberValue: FieldService.giveNumberOrNull(columnRef.type, champ.stringValue),
          dsChampType: dsType,
          dossierId,
          parentRowIndex: parentRow,
          rawJson: champ,
          children:
            champ.__typename === DsChampType.RepetitionChamp
              ? champ.rows?.length
                ? champ.rows
                  .map((row, i: number) => {
                    return this._createFieldsFromRawChamps(row.champs, dossierId, columnHash, i)
                  })
                  .flat()
                : []
              : null,
        } as CreateFieldDto)
      }
    })
    return fields
  }

  private _createFieldsFromDataJson (
    dataJson: Partial<TDossier>,
    dossierId: number,
    columnHash: Record<string, MappingColumn>,
  ): CreateFieldDto[] {
    this.logger.verbose('_createFieldsFromDataJson')
    const champs = dataJson?.champs ?? []
    const annotations = dataJson?.annotations ?? []
    return [
      ...this._createFieldsFromRawChamps(champs as RawChamp[], dossierId, columnHash),
      ...this._createFieldsFromRawChamps(annotations as RawChamp[], dossierId, columnHash),
      ...Object.keys(fixFieldValueFunctions).map((fixFieldId) => {
        const value:string = fixFieldValueFunctions[fixFieldId](dataJson)?.toString() ?? ''
        return {
          ...this._extractColumnRefFieldInformation(columnHash[fixFieldId]),
          stringValue: value.toString(),
          dateValue: FieldService.giveDateOrNull(columnHash[fixFieldId].type, value),
          numberValue: FieldService.giveNumberOrNull(columnHash[fixFieldId].type, value),
          dossierId,
          parentRowIndex: null,
          rawJson: null,
          dsChampType: null,
        }
      }),
    ]
  }

  async overwriteFieldsFromDataJson (
    dataJson: Partial<TDossier>,
    dossierId: number,
    mappingColumns: MappingColumn[],
  ): Promise<Field[]> {
    this.logger.verbose('createFieldsFromDataJsonWithTransaction')
    const columnHash: Record<string, MappingColumn> = Object.fromEntries(mappingColumns.map((mc) => [mc.id, mc]))
    const fields = this._createFieldsFromDataJson(dataJson, dossierId, columnHash)
    await this.repo.delete({ dossierId })
    // TODO: supprimer les fichiers S3
    return this.repo.save(fields)
  }

  async giveFieldType (fieldsId: string[]): Promise<Record<string, FieldTypeKeys>> {
    this.logger.verbose('giveFieldType')
    return await this.repo.query(`
        SELECT DISTINCT "sourceId", type
        FROM fields
        WHERE "sourceId" IN (${fieldsId.map((id) => `'${id}'`).join(',')});
    `).then(result => {
      return Object.fromEntries(result.map((r: { sourceId: string; type: FieldTypeKeys }) => [r.sourceId, r.type]))
    })
  }
}
