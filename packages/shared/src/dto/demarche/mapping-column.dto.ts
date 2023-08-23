import { FieldSourceKeys, FieldTypeKeys, FormatFunctionRefKeys } from '../../enums'

export class MappingColumn {
  id: string
  columnLabel: string | null
  originalLabel: string
  type: FieldTypeKeys
  formatFunctionRef?: FormatFunctionRefKeys
  source: FieldSourceKeys
}
