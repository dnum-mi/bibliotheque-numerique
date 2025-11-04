import type {
  IFilterText,
  ITextFilterCondition,
} from './string.filter.interface'
import type { IDateFilterCondition, IFilterDate } from './date.filter.interface'
import type {
  IFilterNumber,
  INumberFilterCondition,
} from './number.filter.interface'
import type { IEnumFilterCondition, IFilterEnum } from './enum.filter.interface'
import { IFilterNumbers, INumbersFilterCondition } from './numbers.filter.interface'
import { IFilterStrings, IStringsFilterCondition } from './strings.filter.interface'

export type IFilter =
  | IFilterText
  | IFilterDate
  | IFilterNumber
  | IFilterNumbers
  | IFilterStrings
  | IFilterEnum
export type IFilterCondition =
  | ITextFilterCondition
  | INumberFilterCondition
  | INumbersFilterCondition
  | IStringsFilterCondition
  | IEnumFilterCondition
  | IDateFilterCondition
