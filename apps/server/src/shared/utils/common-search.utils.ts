import {
  DynamicKeys,
  FieldType,
  FieldTypeKeys,
  IUserFriendlyFilter,
  DateRange,
  DateRangeKeys,
} from '@biblio-num/shared-utils'

import { BadRequestException } from '@nestjs/common'
import * as dayjs from 'dayjs'
import { ManipulateType } from 'dayjs'
import { FiltersInCustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'
import {
  DateFilterConditionDto,
  DateFilterConditions,
  DateFilterConditionsKeys,
  EnumFilterConditionDto,
  FilterDto, NumberFilterConditionDto,
  NumberFilterConditions,
  TextFilterConditionDto,
  TextFilterConditions,
} from '@/shared/pagination/filters'
import { SortDto } from '@/shared/pagination/sort.dto'
import { SearchDossierDto } from '@/modules/dossiers/objects/dto/search-dossier.dto'

const _manualFilterValueEscapingMechanism = (str: string): string => {
  return str ? str.replace("'", "''") : str
}

//#region FILTERS

//#region TEXT FILTER
const _buildOneTextFilter = (
  originalKey: string,
  filter: TextFilterConditionDto,
  isArray = false,
  prefix?: string,
): string => {
  const key = _adaptKeyForArray(originalKey, isArray, prefix)
  const item = isArray ? 'item' : key
  const escapedFilter = _manualFilterValueEscapingMechanism(filter.filter)
  switch (filter.type) {
  case TextFilterConditions.Contains:
    return `(${key} ILIKE '%${escapedFilter}%')${isArray ? ')' : ''}`
  case TextFilterConditions.NotContains:
    return `(${key} NOT ILIKE '%${escapedFilter}%')${isArray ? ')' : ''}`
  case TextFilterConditions.StartsWith:
    return `(${key} ILIKE '${escapedFilter}%')${isArray ? ')' : ''}`
  case TextFilterConditions.EndsWith:
    return `(${key} ILIKE '%${escapedFilter}')${isArray ? ')' : ''}`
  case TextFilterConditions.Blank:
    return `(${key} IS NULL OR ${item} = '')${isArray ? ')' : ''}`
  case TextFilterConditions.NotBlank:
    return `(${key} IS NOT NULL OR ${item} != '')${isArray ? ')' : ''}`
  default:
    throw new BadRequestException(
      `Unknown string filter condition: ${filter.type}`,
    )
  }
}
//#endregion

//#region DATE FILTER
const dateSqlOperators: Record<DateFilterConditionsKeys, {
  op: string
  value: (filter: DateFilterConditionDto) => string
}> = {
  [DateFilterConditions.Equals]: { op: '=', value: (filter) => `'${filter.filter}'` },
  [DateFilterConditions.NotEqual]: { op: '!=', value: (filter) => `'${filter.filter}'` },
  [DateFilterConditions.LessThan]: { op: '<', value: (filter) => `'${filter.filter}'` },
  [DateFilterConditions.GreaterThan]: { op: '>', value: (filter) => `'${filter.filter}'` },
  [DateFilterConditions.Since]: {
    op: '>',
    value: (filter) => {
      const range = rangeInDays[filter.sinceWhen]
      filter.filter = dayjs().subtract(range.value, range.unit).format()
      return `'${filter.filter}'`
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [DateFilterConditions.Blank]: { op: 'ISNULL', value: (filter) => '' },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [DateFilterConditions.NotBlank]: { op: 'IS NOT NULL', value: (filter) => '' },
  [DateFilterConditions.Between]: { op: 'BETWEEN', value: (filter) => `'${filter.filter}' AND '${filter.filterTo}'` },
}
const rangeInDays: Record<DateRangeKeys, { unit: ManipulateType, value: number }> = {
  [DateRange.TwentyFourHours]: { unit: 'day', value: 1 },
  [DateRange.ThreeDays]: { unit: 'day', value: 3 },
  [DateRange.OneWeek]: { unit: 'week', value: 1 },
  [DateRange.TwoWeeks]: { unit: 'week', value: 2 },
  [DateRange.OneMonth]: { unit: 'month', value: 1 },
  [DateRange.ThreeMonths]: { unit: 'month', value: 3 },
  [DateRange.SixMonths]: { unit: 'month', value: 6 },
  [DateRange.OneYear]: { unit: 'year', value: 1 },
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
  return `(${key} ${dateSqlOperator.op} ${dateSqlOperator.value(filter)}${isArray ? ')' : ''})`
}
//#endregion

//#region NUMBER FILTER
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
//#endregion

//#region ENUM FILTER
const _buildOneEnumFilter = (
  key: string,
  filter: EnumFilterConditionDto,
  isArray = false,
  prefix?: string,
): string => {
  key = _adaptKeyForArray(key, isArray, prefix)
  return `(${key} IN (${filter.filter
    .map((s) => `'${_manualFilterValueEscapingMechanism(s)}'`)
    .join(',')})${isArray ? ')' : ''})`
}
//#endregion

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
      .filter((key) => !!typeHash[key])
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
//#endregion

//#region Search utils

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
//#endregion

//#region French filter dictionnaries

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
  [DateFilterConditions.Since]: 'Depuis',
}

export const dictionnaryHumanReadableOperatorsEnum = {
  default: 'Contient: ',
}

// TODO: duplicata from front. Group it when we have two librairies
const rangeDictionary: Record<DateRangeKeys, string> = {
  TwentyFourHours: '24 heures',
  ThreeDays: '3 jours',
  OneWeek: '1 semaine',
  TwoWeeks: '2 semaines',
  OneMonth: '1 mois',
  ThreeMonths: '3 mois',
  SixMonths: '6 mois',
  OneYear: '1 an',
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
  return [filter.condition1, filter.condition2]
    .filter((c) => c)
    .map(
      (condition) =>
        `${humanReadableOperator(filter.filterType, condition.type)} ${
          condition.filter instanceof Array
            ? condition.filter.join(', ')
            : condition.filter ?? rangeDictionary[(condition as DateFilterConditionDto).sinceWhen]
        }`,
    )
    .join(filter.operator ? (filter.operator === 'AND' ? ' et ' : ' ou ') : '')
}

export const fromCustomFilterToHumanReadableFilter = (
  ffc: FiltersInCustomFilter,
  mch: Record<string, string>,
): IUserFriendlyFilter[] => {
  return ffc
    ? Object.entries(ffc).map(([key, value]) => {
      return {
        label: mch[key] || key,
        value: humanReadableFilter(value),
      }
    })
    : []
}

//#endregion
