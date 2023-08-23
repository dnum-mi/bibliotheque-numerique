import { DsChampType, DsChampTypeKeys } from './ds-champ-type.enum'
import { FormatFunctionRef, FormatFunctionRefKeys, FieldType, FieldTypeKeys } from '@biblio-num/shared'
import { Champ } from '@dnum-mi/ds-api-client'

export const giveFormatFunctionRefFromDsChampType = (
  type: DsChampTypeKeys,
  forDescriptor = false,
): FormatFunctionRefKeys | null => {
  switch (type) {
  case DsChampType.PaysChamp + (forDescriptor ? 'Descriptor' : ''):
    return FormatFunctionRef.country
  default:
    return null
  }
}

export const giveTypeFromDsChampType = (type: DsChampTypeKeys, forDescriptor = false): FieldTypeKeys => {
  switch (type) {
  case DsChampType.CheckboxChamp + (forDescriptor ? 'Descriptor' : ''):
    return FieldType.boolean
  case DsChampType.DatetimeChamp + (forDescriptor ? 'Descriptor' : ''):
  case DsChampType.DateChamp + (forDescriptor ? 'Descriptor' : ''):
    return FieldType.date
  case DsChampType.IntegerNumberChamp + (forDescriptor ? 'Descriptor' : ''):
  case DsChampType.DecimalNumberChamp + (forDescriptor ? 'Descriptor' : ''):
    return FieldType.number
  case DsChampType.PieceJustificativeChamp + (forDescriptor ? 'Descriptor' : ''):
  case DsChampType.TitreIdentiteChamp + (forDescriptor ? 'Descriptor' : ''):
    return FieldType.file
  default:
    return FieldType.string
  }
}

// eslint-disable-next-line dot-notation
export const isRepetitionChamp = (champ: Champ): boolean => champ.__typename === DsChampType.RepetitionChamp

export const isRepetitionChampDescriptor = (champ: Champ): boolean =>
  champ.__typename === DsChampType.RepetitionChamp + 'Descriptor'

export const isFileChamp = (champ: Champ): boolean =>
  giveTypeFromDsChampType(champ.__typename as DsChampTypeKeys) === FieldType.file
