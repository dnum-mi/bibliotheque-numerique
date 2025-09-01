import type { FieldSourceKeys, FieldTypeKeys, FormatFunctionRefKeys } from '..'

export interface IMappingColumnWithoutChildren {
  id: string
  columnLabel?: string
  originalLabel: string
  isHeader?: boolean
  originalDescription?: string
  type?: FieldTypeKeys
  formatFunctionRef?: FormatFunctionRefKeys | undefined
  source: FieldSourceKeys
}

export interface IMappingColumn extends IMappingColumnWithoutChildren {
  children?: IMappingColumnWithoutChildren[]
}
