import type { IdentificationDemarcheKeys } from '@biblio-num/shared'
import {
  IdentificationDemarche,
  FieldSource,
  FieldType,
  FormatFunctionRef,
  MappingColumn,
} from '@biblio-num/shared'
// eslint-disable-next-line max-len
import { fixFieldsInstructionTime } from '@/modules/instruction_time/constante/fix-field-instrucation-times.dictionnary'
import {
  fixFieldsAmounts,
  fixFieldsExcelChamps,
} from '@/modules/dossiers/objects/constante/fix-field-excel-champ.dictionnary'
import { TDossierWithPrefecture } from '@/modules/dossiers/providers/field.service'

type FixFieldValueGetter = (
  dossier: TDossierWithPrefecture,
) => string | number | boolean | Date | null

export const fixFields: MappingColumn[] = [
  {
    id: '96151176-4624-4706-b861-722d2e53545d',
    columnLabel: 'ID',
    originalLabel: 'Id démarche simplifié',
    type: FieldType.number,
    source: FieldSource.fixField,
  },
  {
    id: '1a4b62c4-b81f-4e83-ac34-f6d601b8a8d4',
    columnLabel: 'Status',
    originalLabel: 'Status',
    type: FieldType.enum,
    formatFunctionRef: FormatFunctionRef.status,
    source: FieldSource.fixField,
  },
  {
    id: '9863ce70-6378-4d7e-aca9-b81fb7b97c10',
    columnLabel: 'Préfecture',
    originalLabel: 'préfecture',
    type: FieldType.string,
    source: FieldSource.fixField,
    formatFunctionRef: FormatFunctionRef.prefecture,
  },
  {
    id: '9863ce70-6378-4d7e-aca9-b81fb7b97c11',
    columnLabel: null,
    originalLabel: 'Date de dépot',
    type: FieldType.date,
    source: FieldSource.fixField,
  },
  {
    id: '9863ce70-6378-4d7e-aca9-b81fb7b97c12',
    columnLabel: null,
    originalLabel: 'Date de passage en instruction',
    type: FieldType.date,
    source: FieldSource.fixField,
  },
  {
    id: '9863ce70-6378-4d7e-aca9-b81fb7b97c13',
    columnLabel: null,
    originalLabel: 'Date de passage en construction',
    type: FieldType.date,
    source: FieldSource.fixField,
  },
]

export const fixFieldValueFunctions: Record<string, FixFieldValueGetter> = {
  '96151176-4624-4706-b861-722d2e53545d': (dossier) => dossier.number,
  '1a4b62c4-b81f-4e83-ac34-f6d601b8a8d4': (dossier) => dossier.state,
  '9863ce70-6378-4d7e-aca9-b81fb7b97c10': (dossier) => dossier.prefecture,
  '9863ce70-6378-4d7e-aca9-b81fb7b97c11': (dossier) => dossier.dateDepot,
  '9863ce70-6378-4d7e-aca9-b81fb7b97c12': (dossier) =>
    dossier.datePassageEnInstruction,
  '9863ce70-6378-4d7e-aca9-b81fb7b97c13': (dossier) =>
    dossier.datePassageEnConstruction,
}

export const fixFieldsDemarcheFE: MappingColumn[] = [
  ...fixFieldsInstructionTime,
  fixFieldsExcelChamps,
  ...fixFieldsAmounts,
]

export const fixFieldsByIdentificationDictionary = {
  [IdentificationDemarche.FE]: fixFieldsDemarcheFE,
}

export const getFixFieldsByIdentification = (
  identification?: IdentificationDemarcheKeys,
): MappingColumn[] => [
  ...fixFields,
  ...(identification === IdentificationDemarche.FE
    ? fixFieldsByIdentificationDictionary[identification]
    : []),
]
