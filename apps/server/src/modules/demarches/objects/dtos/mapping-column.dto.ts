import {
  FieldSourceKeys,
  FieldTypeKeys,
  FormatFunctionRefKeys,
  IMappingColumnWithoutChildren,
  IMappingColumn,
} from '@biblio-num/shared-utils'

export class MappingColumnWithoutChildren implements IMappingColumnWithoutChildren {
  id: string
  columnLabel?: string
  originalLabel: string
  isHeader?: boolean
  type?: FieldTypeKeys
  formatFunctionRef?: FormatFunctionRefKeys | undefined
  source: FieldSourceKeys
}

export class MappingColumn extends MappingColumnWithoutChildren implements IMappingColumn {
  children?: MappingColumnWithoutChildren[]
}
