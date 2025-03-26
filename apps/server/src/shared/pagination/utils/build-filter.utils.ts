import {
  DateRange,
  DateRangeKeys,
  FieldType,
  FieldTypeKeys,
} from '@biblio-num/shared'
import { BadRequestException } from '@nestjs/common'
import * as dayjs from 'dayjs'
import { ManipulateType } from 'dayjs'
import {
  DateFilterConditionDto,
  DateFilterConditions,
  DateFilterConditionsKeys,
  EnumFilterConditionDto,
  FilterDateDto,
  FilterDto,
  FilterEnumDto,
  FilterNumberDto,
  FilterTextDto,
  NumberFilterConditionDto,
  NumberFilterConditions,
  TextFilterConditionDto,
  TextFilterConditions,
} from '@/shared/pagination/filters'
import { validate } from 'class-validator'
import {
  FilterNumbersDto,
  NumbersFilterConditionDto,
} from '@/shared/pagination/filters/numbers.filter.dto'

type filterFactory = (
  key: string,
  filter:
    | TextFilterConditionDto
    | DateFilterConditionDto
    | NumberFilterConditionDto
    | EnumFilterConditionDto
    | NumbersFilterConditionDto,
  isArray: boolean,
  prefix?: string,
) => string

const _isFilterConsistent = async (
  filters: Record<string, FilterDto>,
  typeHash: Record<string, FieldTypeKeys>,
): Promise<boolean> => {
  const __common = async (Dto, key: string): Promise<boolean> => {
    const obj = Object.assign(new Dto(), filters[key])
    return validate(obj).then((errors) => !errors.length)
  }
  return filters
    ? Promise.all(
      Object.keys(filters).map(async (key) => {
        switch (typeHash[key]) {
        case FieldType.string:
          return __common(FilterTextDto, key)
        case FieldType.number:
          return __common(FilterNumberDto, key)
        case FieldType.boolean:
        case FieldType.enum:
          return __common(FilterEnumDto, key)
        case FieldType.date:
          return __common(FilterDateDto, key)
        case FieldType.numbers:
          return __common(FilterNumbersDto, key)
        default:
          return false
        }
      }),
    ).then((tab) => tab.reduce((a, b) => a && b))
    : true
}

const _manualFilterValueEscapingMechanism = (str: string): string => {
  return str ? str.replace("'", "''") : str === null ? '' : str
}

const _adaptKeyForArray = (
  key: string,
  isArray = false,
  prefix?: string,
  forDate: boolean = false,
): string => {
  const keyWithPrefix = `${prefix ? `${prefix}.` : ''}"${key}"`
  return isArray
    ? `EXISTS (SELECT 1 FROM UNNEST(${keyWithPrefix}) AS item WHERE ${forDate ? 'DATE(item)' : 'item'}`
    : `${forDate ? `DATE(${keyWithPrefix})` : keyWithPrefix}`
}

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
const dateSqlOperators: Record<
  DateFilterConditionsKeys,
  {
    op: string
    value: (filter: DateFilterConditionDto) => string
  }
> = {
  [DateFilterConditions.Equals]: {
    op: '=',
    value: (filter) => `'${filter.filter}'`,
  },
  [DateFilterConditions.NotEqual]: {
    op: '!=',
    value: (filter) => `'${filter.filter}'`,
  },
  [DateFilterConditions.LessThan]: {
    op: '<',
    value: (filter) => `'${filter.filter}'`,
  },
  [DateFilterConditions.GreaterThan]: {
    op: '>',
    value: (filter) => `'${filter.filter}'`,
  },
  [DateFilterConditions.Since]: {
    op: '>',
    value: (filter) => {
      const range = rangeInDays[filter.sinceWhen]
      filter.filter = dayjs().subtract(range.value, range.unit).format()
      return `'${filter.filter}'`
    },
  },
  [DateFilterConditions.Blank]: { op: 'ISNULL', value: () => '' },
  [DateFilterConditions.NotBlank]: { op: 'IS NOT NULL', value: () => '' },
  [DateFilterConditions.Between]: {
    op: 'BETWEEN',
    value: (filter) => `'${filter.filter}' AND '${filter.filterTo}'`,
  },
}
const rangeInDays: Record<
  DateRangeKeys,
  { unit: ManipulateType; value: number }
> = {
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
  key = _adaptKeyForArray(key, isArray, prefix, true)
  return `(${key} ${dateSqlOperator.op} ${dateSqlOperator.value(filter)}${
    isArray ? ')' : ''
  })`
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

//#region NUMBERS FILTER
const _buildOneNumbersFilter = (
  key: string,
  filter: NumbersFilterConditionDto,
  isArray = false,
  prefix?: string,
): string => {
  key = _adaptKeyForArray(key, isArray, prefix)
  if (isArray) {
    throw new Error('Array of numbers is not supported yet for array keys')
  }
  const numbers = filter.filter.filter((n) => !isNaN(n))
  return `(${numbers.map((n) => `${key} @> '${n}'`).join(' OR ')}${
    filter.includeEmpty
      ? `${numbers.length ? ' OR ' : ''}${key} = '[]'`
      : ''
  })`
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
  const values = filter.filter
    .map((s) => `'${_manualFilterValueEscapingMechanism(s)}'`)
    .join(',')
  if (values === '\'\'') {
    throw new BadRequestException('Empty string is not a correct enum value.')
  }
  return `(${key} IN (${values})${isArray ? ')' : ''})`
}
//#endregion

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
  case FieldType.boolean:
  case FieldType.enum:
    filterFactory = _buildOneEnumFilter
    break
  case FieldType.numbers:
    filterFactory = _buildOneNumbersFilter
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

export const buildFilterQuery = async (
  filters: Record<string, FilterDto>,
  typeHash: Record<string, FieldTypeKeys>,
  isArray = false,
): Promise<string> => {
  if (!(await _isFilterConsistent(filters, typeHash))) {
    throw new BadRequestException('Your filter does not match the schema.')
  }
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

export const buildFilterQueryWithWhere = async (
  filters: Record<string, FilterDto>,
  typeHash: Record<string, FieldTypeKeys>,
  isArray = false,
): Promise<string> => {
  const query = await buildFilterQuery(filters, typeHash, isArray)
  return query ? `WHERE ${query}` : ''
}
