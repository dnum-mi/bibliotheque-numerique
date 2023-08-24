class MappingColumnWithoutChildren {
  id: string
  columnLabel?: string
  originalLabel: string
  type: string
  formatFunctionRef?: string | undefined
  source: string
}

export class MappingColumn extends MappingColumnWithoutChildren {
  children?: MappingColumnWithoutChildren[]
}
