// import { FieldType, type FieldTypeKeys } from '@biblio-num/shared'
//
const fieldTypesDict = {
  string: 'agTextColumnFilter',
  number: 'agNumberColumnFilter',
  date: 'agDateColumnFilter',
  boolean: 'agSetColumnFilter',
  default: 'agTextColumnFilter',
} as const

// TODO: use FieldType but enum from library doesnt work in front.
export const fromFieldTypeToAgGridFilter = (fieldType: keyof typeof fieldTypesDict) => fieldTypesDict[fieldType] || fieldTypesDict.default
