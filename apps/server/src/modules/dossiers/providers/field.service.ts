import { Injectable } from '@nestjs/common'
import { BaseEntityService } from '../../../shared/base-entity/base-entity.service'
import { Field } from '../objects/entities/field.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { Dossier as TDossier } from '@dnum-mi/ds-api-client/dist/@types/types'
import { DsChampType } from '../../../shared/modules/ds-api/objects/ds-champ-type.enum'
import { FieldType } from '../objects/enums/field-type.enum'
import { CreateFieldDto } from '../objects/dto/fields/create-field.dto'
import { CustomChamp } from '@dnum-mi/ds-api-client/src/@types/types'
import { fixFieldValueFunctions } from '../objects/constante/fix-field.dictionnary'
import { MappingColumn } from '../../demarches/objects/entities/mapping-column.object'

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
          throw new Error(`There is no reference of ${id} in column hash`)
        }
        fields.push({
          ...this._extractColumnRefFieldInformation(columnRef),
          stringValue: champ.stringValue,
          dateValue: columnRef.type === FieldType.date && champ.stringValue.length ? new Date(champ.stringValue) : null,
          numberValue: columnRef.type === FieldType.number ? parseFloat(champ.stringValue) : null,
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
          dateValue:
            ((columnHash[fixFieldId].type === FieldType.date) && value.length) ? new Date(value as string) : null,
          numberValue: columnHash[fixFieldId].type === FieldType.number ? parseFloat(value as string) : null,
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
}
