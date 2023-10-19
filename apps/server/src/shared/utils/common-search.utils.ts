import {
  DateFilterConditionDto,
  DateFilterConditions,
  DynamicKeys,
  FieldType,
  FieldTypeKeys,
  FilterDto,
  NumberFilterConditionDto,
  NumberFilterConditions,
  SearchDossierDto,
  SortDto,
  TextFilterConditionDto,
  TextFilterConditions,
  UserFriendlyFilter,
  EnumFilterConditionDto,
} from '@biblio-num/shared'
import { BadRequestException } from '@nestjs/common'
import { FiltersInCustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'

/* region FILTERS */

/* region TEXT FILTER */
const _buildOneTextFilter = (
  key: string,
  filter: TextFilterConditionDto,
  isArray = false,
  prefix?: string,
): string => {
  key = _adaptKeyForArray(key, isArray, prefix)
  switch (filter.type) {
  case TextFilterConditions.Contains:
    return `(${key} ILIKE '%${filter.filter}%')${isArray ? ')' : ''}`
  case TextFilterConditions.NotContains:
    return `(${key} NOT ILIKE '%${filter.filter}%')${isArray ? ')' : ''}`
  case TextFilterConditions.StartsWith:
    return `(${key} ILIKE '${filter.filter}%')${isArray ? ')' : ''}`
  case TextFilterConditions.EndsWith:
    return `(${key} ILIKE '%${filter.filter}')${isArray ? ')' : ''}`
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
  prefix?: string,
): string => {
  const dateSqlOperator = dateSqlOperators[filter.type]
  if (!dateSqlOperator) {
    throw new BadRequestException(
      `Unknown date filter condition: ${filter.type}`,
    )
  }
  key = _adaptKeyForArray(key, isArray, prefix)
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
  prefix?: string,
): string => {
  const numberSqlOperator = numberSqlOperators[filter.type]
  if (!numberSqlOperator) {
    throw new BadRequestException(
      `Unknown number filter condition: ${filter.type}`,
    )
  }
  key = _adaptKeyForArray(key, isArray, prefix)
  return `(${key} ${numberSqlOperator} ${filter.filter}${isArray ? ')' : ''})`
}
/* endregion */

/* region ENUM FILTER */
const _buildOneEnumFilter = (
  key: string,
  filter: EnumFilterConditionDto,
  isArray = false,
  prefix?: string,
): string => {
  key = _adaptKeyForArray(key, isArray, prefix)
  return `(${key} IN (${filter.filter.map((s) => `'${s}'`).join(',')})${isArray ? ')' : ''})`
}
/* endregion */

const _adaptKeyForArray = (
  key: string,
  isArray = false,
  prefix?: string,
): string => {
  const keyWithPrefix = `${prefix ? `${prefix}.` : ''}"${key}"`
  return isArray
    ? `EXISTS (SELECT 1 FROM UNNEST(${keyWithPrefix}) AS item WHERE item`
    : `${keyWithPrefix}`
}

type filterFactory = (
  key: string,
  filter:
    | TextFilterConditionDto
    | DateFilterConditionDto
    | NumberFilterConditionDto
    | EnumFilterConditionDto,
  isArray: boolean,
  prefix?: string,
) => string

// TODO: Injection SQL
export const buildOneFilter = (
  key: string,
  filter: FilterDto,
  type: FieldTypeKeys,
  isArray = false,
  prefix?: string,
): string => {
  let filterFactory: filterFactory
  switch (type) {
  case FieldType.date:
    filterFactory = _buildOneDateFilter
    break
  case FieldType.number:
    filterFactory = _buildOneNumberFilter
    break
  case FieldType.enum:
    filterFactory = _buildOneEnumFilter
    break
  default:
    filterFactory = _buildOneTextFilter
  }
  let result = filterFactory(key, filter.condition1, isArray, prefix)
  if (filter.operator) {
    result = `${result} ${filter.operator} ${filterFactory(
      key,
      filter.condition2,
      isArray,
      prefix,
    )}`
  }
  return result
}

export const buildFilterQuery = (
  filters: Record<string, FilterDto>,
  typeHash: Record<string, FieldTypeKeys>,
  isArray = false,
): string => {
  if (!filters || !Object.keys(filters).length) {
    return ''
  } else {
    return Object.keys(filters)
      .map(
        (key) =>
          `(${buildOneFilter(key, filters[key], typeHash[key], isArray)})`,
      )
      .join(' AND ')
  }
}

export const buildFilterQueryWithWhere = (
  filters: Record<string, FilterDto>,
  typeHash: Record<string, FieldTypeKeys>,
  isArray = false,
): string => {
  const query = buildFilterQuery(filters, typeHash, isArray)
  return query ? `WHERE ${query}` : ''
}
/* endregion */

/* region Search utils */

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
/* endregion */

/* region French filter dictionnaries */

export const dictionaryHumanReadableOperatorsNumber = {
  [NumberFilterConditions.Equals]: 'Égal à:',
  [NumberFilterConditions.NotEqual]: 'Différent de:',
  [NumberFilterConditions.LessThan]: 'Plus petit que:',
  [NumberFilterConditions.GreaterThan]: 'Plus grand que:',
  [NumberFilterConditions.LessThanOrEqual]: 'Plus petit ou égal à:',
  [NumberFilterConditions.GreaterThanOrEqual]: 'Plus grand ou égal à:',
}

// TODO: In_range, blank, no_blank
export const dictionaryHumanReadableOperatorsText = {
  [TextFilterConditions.Contains]: 'Contient le mot:',
  [TextFilterConditions.NotContains]: 'Ne contient pas le mot:',
  [TextFilterConditions.StartsWith]: 'Commence par le mot:',
  [TextFilterConditions.EndsWith]: 'Fini par le mot:',
  [TextFilterConditions.Blank]: 'Les non-renseignés',
  [TextFilterConditions.NotBlank]: 'Les renseignés',
}

// TODO: In_range, blank, no_blank
export const dictionaryHumanReadableOperatorsDate = {
  [DateFilterConditions.Equals]: 'Le:',
  [DateFilterConditions.NotEqual]: 'En dehors du:',
  [DateFilterConditions.LessThan]: 'Avant le:',
  [DateFilterConditions.GreaterThan]: 'Après le:',
}

export const dictionnaryHumanReadableOperatorsEnum = {
  default: 'Contient: ',
}

// TODO: In_range, blank, no_blank
export const dictionaryHumanReadableFilterType = {
  text: dictionaryHumanReadableOperatorsText,
  number: dictionaryHumanReadableOperatorsNumber,
  date: dictionaryHumanReadableOperatorsDate,
  enum: dictionnaryHumanReadableOperatorsEnum,
}
export const humanReadableOperator = (filterType, type): string =>
  dictionaryHumanReadableFilterType[filterType]?.[type || 'default'] || ''

export const humanReadableFilter = (filter: FilterDto): string => {
  // TODO: A faire
  return [filter.condition1, filter.condition2]
    .filter((c) => c)
    .map(
      (condition) =>
        `${humanReadableOperator(filter.filterType, condition.type)} ${
          condition.filter instanceof Array
            ? condition.filter.join(', ')
            : condition.filter
        }`,
    )
    .join(filter.operator ? (filter.operator === 'AND' ? ' et ' : ' ou ') : '')
}

export const fromCustomFilterToHumanReadableFilter = (
  ffc: FiltersInCustomFilter,
  mch: Record<string, string>,
): UserFriendlyFilter[] => {
  return ffc
    ? Object.entries(ffc).map(([key, value]) => {
      return {
        label: mch[key] || key,
        value: humanReadableFilter(value),
      }
    })
    : []
}

/* endregion */
