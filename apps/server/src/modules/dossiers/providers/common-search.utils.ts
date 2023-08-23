import { DynamicKeys, FieldType, FieldTypeKeys, SortDto } from '@biblio-num/shared'

export const buildPaginationQuery = (page: number, perPage: number): string => {
  return `OFFSET ${(page - 1) * perPage} LIMIT ${perPage}`
}

export const buildSortQuery = (sorts: SortDto<DynamicKeys>[]): string => {
  return !sorts?.length ? '' : `ORDER BY ${sorts.map((s) => `"${s.key}" ${s.order}`).join(', ')}`
}

// TODO: filter with aggrid filter model
export const buildFilterQuery = (typeHash: Record<string, FieldTypeKeys>): string => {
  if (typeHash) {
    return ''
  }
  return ''
}

export const deduceFieldToQueryFromType = (type: FieldTypeKeys): string => {
  switch (type) {
  case FieldType.date:
    return 'dateValue'
  case FieldType.number:
    return 'numberValue'
  default:
    return 'stringValue'
  }
}
