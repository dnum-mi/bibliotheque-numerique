import { FieldSourceKeys, FieldTypeKeys, FormatFunctionRefKeys } from '../../enums'

export class MappingColumnWithoutChildren {
  id: string
  columnLabel?: string
  originalLabel: string
  type?: FieldTypeKeys
  formatFunctionRef?: FormatFunctionRefKeys | undefined
  source: FieldSourceKeys
}

export class MappingColumn extends MappingColumnWithoutChildren {
  children?: MappingColumnWithoutChildren[]
}
