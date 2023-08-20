import { FieldTypeKeys } from '../../../dossiers/objects/enums/field-type.enum'
import { FormatFunctionRefKeys } from '@biblio-num/shared'
import { FieldSourceKeys } from '../../../dossiers/objects/enums/field-source.enum'

export class MappingColumn {
  id: string
  columnLabel: string | null
  originalLabel: string
  type: FieldTypeKeys
  formatFunctionRef?: FormatFunctionRefKeys
  source: FieldSourceKeys
}
