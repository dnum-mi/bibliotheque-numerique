import {
  DynamicKeys,
  FieldType,
  FieldTypeKeys,
  FilterDto,
  SortDto,
  TextFilterConditionDto,
  DateFilterConditionDto,
  NumberFilterConditionDto,
  TextFilterConditions,
  DateFilterConditions,
} from '@biblio-num/shared'

const _buildOneTextFilter = (
  key: string,
  filter: TextFilterConditionDto,
): string => {
  switch (filter.type) {
  case TextFilterConditions.Contains:
    return `(${key} LIKE '%${filter.filter}%')`
  case TextFilterConditions.NotContains:
    return `(${key} NOT LIKE '%${filter.filter}%')`
  case TextFilterConditions.StartsWith:
    return `(${key} LIKE '${filter.filter}%')`
  case TextFilterConditions.EndsWith:
    return `(${key} LIKE '%${filter.filter}')`
  case TextFilterConditions.Blank:
    return `(${key} IS NULL OR ${key} = '')`
  case TextFilterConditions.NotBlank:
    return `(${key} IS NOT NULL AND ${key} != '')`
  }
}

const _buildOneDateFilter = (
  key: string,
  filter: DateFilterConditionDto,
): string => {
  return ''
}

const _buildOneNumberFilter = (
  key: string,
  filter: NumberFilterConditionDto,
): string => {
  return ''
}

const _buildOneFilter = (
  key: string,
  filter: FilterDto,
  type: FieldTypeKeys,
): string => {
  const field = deduceFieldToQueryFromType(type)
  const filterFactory =
    filter.filterType === 'date'
      ? _buildOneDateFilter
      : filter.filterType === 'number'
        ? _buildOneNumberFilter
        : _buildOneTextFilter
  const condition1 = filterFactory(key, filter.condition1)
}

// TODO: filter with aggrid filter model
export const buildFilterQuery = (
  filters: Record<string, FilterDto>,
  typeHash: Record<string, FieldTypeKeys>,
): string => {
  const keys = Object.keys(filters)
  if (!keys.length) {
    return ''
  } else {
    return (
      'WHERE ' +
      keys
        .map((key) => `(${_buildOneFilter(key, filters[key], typeHash[key])}`)
        .join(' AND ')
    )
  }
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

export const buildPaginationQuery = (page: number, perPage: number): string => {
  return `OFFSET ${(page - 1) * perPage} LIMIT ${perPage}`
}

export const buildSortQuery = (sorts: SortDto<DynamicKeys>[]): string => {
  return !sorts?.length
    ? ''
    : `ORDER BY ${sorts.map((s) => `"${s.key}" ${s.order}`).join(', ')}`
}
