import { Champ } from '@dnum-mi/ds-api-client/src/@types/types'
import { FieldType, FieldTypeKeys } from './field-type.enum'

export const DsChampType = {
  UnknownChamp: 'UnknownChamp',
  AddressChamp: 'AddressChamp',
  CarteChamp: 'CarteChamp',
  CheckboxChamp: 'CheckboxChamp',
  CiviliteChamp: 'CiviliteChamp',
  CommuneChamp: 'CommuneChamp',
  DateChamp: 'DateChamp',
  DatetimeChamp: 'DatetimeChamp',
  DecimalNumberChamp: 'DecimalNumberChamp',
  DepartementChamp: 'DepartementChamp',
  DossierLinkChamp: 'DossierLinkChamp',
  EpciChamp: 'EpciChamp',
  IntegerNumberChamp: 'IntegerNumberChamp',
  LinkedDropDownListChamp: 'LinkedDropDownListChamp',
  MultipleDropDownListChamp: 'MultipleDropDownListChamp',
  PaysChamp: 'PaysChamp',
  PieceJustificativeChamp: 'PieceJustificativeChamp',
  RegionChamp: 'RegionChamp',
  RepetitionChamp: 'RepetitionChamp',
  SiretChamp: 'SiretChamp',
  TextChamp: 'TextChamp',
  TitreIdentiteChamp: 'TitreIdentiteChamp',
}

export type DsChampTypeKeys = (typeof DsChampType)[keyof typeof DsChampType];

export const giveTypeFromDsChampType = (type: DsChampTypeKeys): FieldTypeKeys => {
  switch (type) {
  case DsChampType.CheckboxChamp:
    return FieldType.boolean
  case DsChampType.DatetimeChamp:
  case DsChampType.DateChamp:
    return FieldType.date
  case DsChampType.IntegerNumberChamp:
  case DsChampType.DecimalNumberChamp:
    return FieldType.number
  case DsChampType.PieceJustificativeChamp:
  case DsChampType.TitreIdentiteChamp:
    return FieldType.file
  default:
    return FieldType.string
  }
}

// eslint-disable-next-line dot-notation
export const isRepetitionChamp = (champ: Champ): boolean => champ['__typename'] === DsChampType.RepetitionChamp

export const isFileChamp = (champ: Champ): boolean =>
  // eslint-disable-next-line dot-notation
  giveTypeFromDsChampType(champ['__typename'] as DsChampTypeKeys) === FieldType.file
