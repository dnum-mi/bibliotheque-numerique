import { Injectable } from '@nestjs/common'
import { BaseEntityService } from '../../../shared/base-entity/base-entity.service'
import { Field } from '../objects/entities/field.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { Dossier as TDossier } from '@dnum-mi/ds-api-client/dist/@types/types'

import { DsChampType, DsChampTypeKeys, giveTypeFromDsChampType } from '../objects/enums/ds-champ-type.enum'
import { FormatFunctionRef, FormatFunctionRefKeys } from '@biblio-num/shared'
import { FieldType } from '../objects/enums/field-type.enum'
import { CreateFieldDto } from '../objects/dto/fields/create-field.dto'
import { CustomChamp } from '@dnum-mi/ds-api-client/src/@types/types'
import { dossierFields } from '../objects/constante/dossier-fields-record.const'
import { FieldSource } from '../objects/enums/field-source.enum'

type RawChamp = CustomChamp & {
  __typename: string;
  rows: Array<{ champs: Array<RawChamp> }>;
};

@Injectable()
export class FieldService extends BaseEntityService<Field> {
  constructor (@InjectRepository(Field) protected repo: Repository<Field>, protected logger: LoggerService) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  static giveFormatFunctionRef (type: DsChampTypeKeys): FormatFunctionRefKeys | null {
    switch (type) {
    case DsChampType.PaysChamp:
      return FormatFunctionRef.country
    default:
      return null
    }
  }

  private _createFieldsFromRawChamps (
    champs: Array<RawChamp>,
    dossierId: number,
    parentRow: number = null,
  ): CreateFieldDto[] {
    this.logger.verbose('_createFieldsFromRawChamps')
    this.logger.debug(`parentRow: ${parentRow}`)
    const fields: CreateFieldDto[] = []
    champs.forEach((champ) => {
      this.logger.debug(`champ: ${JSON.stringify(champ.label)}`)
      if (!champ.__typename || !champ.id || !champ.label) {
        this.logger.warn(`champ is not valid: ${JSON.stringify(champ)}`)
      } else {
        const dsType = DsChampType[champ.__typename] ?? DsChampType.UnknownChamp
        const type = giveTypeFromDsChampType(dsType)
        fields.push({
          dsFieldId: champ.champDescriptor.id,
          label: champ.label,
          stringValue: champ.stringValue,
          dateValue: type === FieldType.date ? new Date(champ.stringValue) : null,
          numberValue: type === FieldType.number ? parseFloat(champ.stringValue) : null,
          dsChampType: dsType,
          dossierId,
          fieldSource: FieldSource.champs,
          parentRowIndex: parentRow,
          formatFunctionRef: FieldService.giveFormatFunctionRef(dsType),
          type,
          rawJson: champ,
          children:
            champ.__typename === DsChampType.RepetitionChamp
              ? champ.rows?.length
                ? champ.rows
                  .map((row, i: number) => {
                    return this._createFieldsFromRawChamps(row.champs, dossierId, i)
                  })
                  .flat()
                : []
              : null,
        } as CreateFieldDto)
      }
    })
    return fields
  }

  private _createFieldsFromRawDossier (dossierJson: Partial<TDossier>, dossierId: number): CreateFieldDto[] {
    this.logger.verbose('_createFieldsFromRawDossier')
    const fields: CreateFieldDto[] = []
    Object.keys(dossierFields).forEach((key) => {
      const value = dossierJson[dossierFields[key]]
      if (value !== undefined) {
        fields.push({
          dsFieldId: null,
          label: key,
          stringValue: value.toString(),
          dateValue: null,
          numberValue: null,
          dsChampType: null,
          fieldSource: FieldSource.dossier,
          type: FieldType.string,
          formatFunctionRef: null,
          parentRowIndex: null,
          children: null,
          dossierId,
          rawJson: null,
        })
      }
    })
    return fields
  }

  private _createFieldsFromDataJson (dataJson: Partial<TDossier>, dossierId: number): CreateFieldDto[] {
    this.logger.verbose('_createFieldsFromDataJson')
    const champs = dataJson?.champs
    if (!champs) {
      throw new Error('Cannot map field without champs in dataJson.')
    }

    const champsFields = this._createFieldsFromRawChamps(champs as RawChamp[], dossierId)

    const dossierFields = this._createFieldsFromRawDossier(dataJson, dossierId)

    return [...champsFields, ...dossierFields]
  }

  async overwriteFieldsFromDataJson (dataJson: Partial<TDossier>, dossierId: number): Promise<Field[]> {
    this.logger.verbose('createFieldsFromDataJsonWithTransaction')
    const fields = this._createFieldsFromDataJson(dataJson, dossierId)
    await this.repo.delete({ dossierId })
    // TODO: supprimer les fichiers S3
    return this.repo.save(fields)
  }
}

/*
   solution 1: mettre des uuid partout
   solution 2: supprimer tous les champs et les insérer (actuel)
      => supprimer tous les fichiers du s3 et les réuploder

   solution 3: faire un upsert manuel
       - récupérer les champs existants
       - supprimer les champs qui ne sont plus dans le dossier
        - mettre à jour les champs qui ont changé
        - créer les nouveaux champs

   this.repo.upsert([
   ])
 */
