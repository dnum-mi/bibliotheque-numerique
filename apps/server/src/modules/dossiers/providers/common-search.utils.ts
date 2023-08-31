import {
  DateFilterConditionDto,
  DateFilterConditions,
  DynamicKeys,
  FieldType,
  FieldTypeKeys,
  FilterDto,
  NumberFilterConditionDto,
  NumberFilterConditions,
  SortDto,
  TextFilterConditionDto,
  TextFilterConditions,
} from '@biblio-num/shared'
import { BadRequestException } from '@nestjs/common'

/* region FILTERS */

/* region TEXT FILTER */
const _buildOneTextFilter = (
  key: string,
  filter: TextFilterConditionDto,
  isArray = false,
): string => {
  key = _adaptKeyForArray(key, isArray)
  switch (filter.type) {
  case TextFilterConditions.Contains:
    return `(${key} LIKE '%${filter.filter}%')${isArray ? ')' : ''}`
  case TextFilterConditions.NotContains:
    return `(${key} NOT LIKE '%${filter.filter}%')${isArray ? ')' : ''}`
  case TextFilterConditions.StartsWith:
    return `(${key} LIKE '${filter.filter}%')${isArray ? ')' : ''}`
  case TextFilterConditions.EndsWith:
    return `(${key} LIKE '%${filter.filter}')${isArray ? ')' : ''}`
  case TextFilterConditions.Blank:
    return `(${key} IS NULL OR item = "")${isArray ? ')' : ''}`
  case TextFilterConditions.NotBlank:
    return `(${key} IS NOT NULL OR item != "")${isArray ? ')' : ''}`
  default:
    throw new BadRequestException(
      `Unknown string filter condition: ${filter.type}`,
    )
  }
}
/* endregion */

/* region DATE FILTER */
const dateSqlOperators = {
  [DateFilterConditions.Equals]: '=',
  [DateFilterConditions.NotEqual]: '!=',
  [DateFilterConditions.LessThan]: '<',
  [DateFilterConditions.GreaterThan]: '>',
}
const _buildOneDateFilter = (
  key: string,
  filter: DateFilterConditionDto,
  isArray = false,
): string => {
  const dateSqlOperator = dateSqlOperators[filter.type]
  if (!dateSqlOperator) {
    throw new BadRequestException(
      `Unknown date filter condition: ${filter.type}`,
    )
  }
  key = _adaptKeyForArray(key, isArray)
  return `(${key} ${dateSqlOperator} '${filter.filter}'${isArray ? ')' : ''})`
}
/* endregion */

/* region NUMBER FILTER */
const numberSqlOperators = {
  [NumberFilterConditions.Equals]: '=',
  [NumberFilterConditions.NotEqual]: '!=',
  [NumberFilterConditions.LessThan]: '<',
  [NumberFilterConditions.GreaterThan]: '>',
  [NumberFilterConditions.LessThanOrEqual]: '<=',
  [NumberFilterConditions.GreaterThanOrEqual]: '>=',
}
const _buildOneNumberFilter = (
  key: string,
  filter: NumberFilterConditionDto,
  isArray = false,
): string => {
  const numberSqlOperator = numberSqlOperators[filter.type]
  if (!numberSqlOperator) {
    throw new BadRequestException(
      `Unknown number filter condition: ${filter.type}`,
    )
  }
  key = _adaptKeyForArray(key, isArray)
  return `(${key} ${numberSqlOperator} ${filter.filter}${isArray ? ')' : ''})`
}
/* endregion */

const _adaptKeyForArray = (key: string, isArray = false): string =>
  isArray
    ? `EXISTS (SELECT 1 FROM UNNEST("${key}") AS item WHERE item`
    : `"${key}"`

type filterFactory = (
  key: string,
  filter:
    | TextFilterConditionDto
    | DateFilterConditionDto
    | NumberFilterConditionDto,
  isArray: boolean,
) => string

const _buildOneFilter = (
  key: string,
  filter: FilterDto,
  type: FieldTypeKeys,
  isArray = false,
): string => {
  const filterFactory: filterFactory =
    type === FieldType.date
      ? _buildOneDateFilter
      : type === FieldType.number
        ? _buildOneNumberFilter
        : _buildOneTextFilter
  let result = filterFactory(key, filter.condition1, isArray)
  if (filter.operator) {
    result = `${result} ${filter.operator} ${filterFactory(key, filter.condition2, isArray)}`
  }
  return result
}

export const buildFilterQuery = (
  filters: Record<string, FilterDto>,
  typeHash: Record<string, FieldTypeKeys>,
  isArray = false,
): string => {
  if (!filters) {
    return ''
  } else {
    return (
      'WHERE ' +
      Object.keys(filters)
        .map(
          (key) =>
            `(${_buildOneFilter(key, filters[key], typeHash[key], isArray)})`,
        )
        .join(' AND ')
    )
  }
}
/* endregion */

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
