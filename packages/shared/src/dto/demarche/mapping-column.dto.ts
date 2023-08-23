import { FieldSourceKeys, FieldTypeKeys, FormatFunctionRefKeys } from '../../enums'

interface IMappingColumn {
  id: string
  columnLabel?: string
  originalLabel: string
  type: FieldTypeKeys
  formatFunctionRef?: FormatFunctionRefKeys
  source: FieldSourceKeys
}
export class MappingColumn implements IMappingColumn {
  id: string
  columnLabel?: string
  originalLabel: string
  type: string
  formatFunctionRef?: string | undefined
  source: string
  children?: IMappingColumn[]
}
