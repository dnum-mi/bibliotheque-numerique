import { DynamicKeys, FieldType, FieldTypeKeys } from '@biblio-num/shared'
import { SortDto } from '@/shared/pagination/sort.dto'
import { SearchDossierDto } from '@/modules/dossiers/objects/dto/search-dossier.dto'

const fieldTypeDict = {
  [FieldType.date]: 'dateValue',
  [FieldType.number]: 'numberValue',
  default: 'stringValue',
} as const
type FieldTypeValues = (typeof fieldTypeDict)[keyof typeof fieldTypeDict]
export const deduceFieldToQueryFromType = (
  type: FieldTypeKeys,
): FieldTypeValues => fieldTypeDict[type] || fieldTypeDict.default

export const buildPaginationQuery = (page: number, perPage: number): string => {
  return `OFFSET ${(page - 1) * perPage} LIMIT ${perPage}`
}

export const buildSortQuery = (sorts: SortDto<DynamicKeys>[]): string => {
  return !sorts?.length
    ? ''
    : `ORDER BY ${sorts.map((s) => `"${s.key}" ${s.order}`).join(', ')}`
}

export const adjustDto = (dto: SearchDossierDto): SearchDossierDto => {
  let newFilter = dto.filters
  if (dto.filters && !!Object.keys(dto.filters).length) {
    newFilter = { ...dto.filters }
    // clean filter about columns that are not selected
    Object.keys(dto.filters).forEach((key) => {
      if (!dto.columns.includes(key)) {
        delete newFilter[key]
      }
    })
  }
  // clean filter about columns that are not selected
  const newSort = (dto.sorts || []).filter((s) => dto.columns.includes(s.key))
  return {
    ...dto,
    sorts: newSort,
    filters: newFilter,
  }
}
