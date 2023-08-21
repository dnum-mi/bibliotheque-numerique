import { DynamicKeys } from '../objects/dto/search-dossier.dto'
import { SortDto } from '@biblio-num/shared'
import { FieldTypeKeys } from '../objects/enums/field-type.enum'

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
