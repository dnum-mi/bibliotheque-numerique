import { CustomChamp, Dossier } from '@dnum-mi/ds-api-client'
import { FieldSourceKeys } from './field-source.enum'
import { FieldTypeKeys } from './field-type.enum'
import { FormatFunctionRefKeys } from './format-function-ref.enum'

export interface IField {
  id: number
  createdAt: Date
  updatedAt: Date
  fieldSource: FieldSourceKeys
  dsChampType: string | null
  type: FieldTypeKeys
  formatFunctionRef: FormatFunctionRefKeys | null
  sourceId: string
  stringValue: string
  dateValue: Date | null
  numberValue: number | null
  parent?: IField | null
  parentId: number | null
  children?: IField[] | null
  parentRowIndex: number | null
  label: string
  rawJson: Partial<CustomChamp> | null
  dossier?: Dossier
  dossierId: number
  code: string | null
  anonymisedAt?: Date | null
}
