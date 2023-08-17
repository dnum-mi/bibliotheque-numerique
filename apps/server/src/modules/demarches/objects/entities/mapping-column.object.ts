import { FieldTypeKeys } from '../../../dossiers/objects/enums/field-type.enum'
import { FormatFunctionRefKeys } from '@biblio-num/shared'

export class MappingColumn {
  id: string
  columnLabel: string | null
  originalLabel: string
  type: FieldTypeKeys
  formatFunctionRef?: FormatFunctionRefKeys
}
