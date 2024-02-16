import type { IFilterText, ITextFilterCondition } from './string.filter.interface'
import type { IDateFilterCondition, IFilterDate } from './date.filter.interface'
import type { IFilterNumber, INumberFilterCondition } from './number.filter.interface'
import type { IEnumFilterCondition, IFilterEnum } from './enum.filter.interface'

export type IFilter = IFilterText | IFilterDate | IFilterNumber | IFilterEnum
export type IFilterCondition = ITextFilterCondition | INumberFilterCondition | IEnumFilterCondition | IDateFilterCondition
