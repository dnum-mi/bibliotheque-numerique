import type { DateRangeKeys } from '../common'

export const DateFilterConditions = {
  Equals: 'equals',
  NotEqual: 'notEqual',
  LessThan: 'lessThan',
  GreaterThan: 'greaterThan',
  Blank: 'blank',
  NotBlank: 'notBlank',
  Between: 'inRange',
  Since: 'since',
}

export type DateFilterConditionsKeys =
  (typeof DateFilterConditions)[keyof typeof DateFilterConditions]

export interface IDateFilterCondition {
  type: DateFilterConditionsKeys
  sinceWhen?: DateRangeKeys
  filter: null | string
  filterTo?: null | string
}

export interface IFilterDate {
  filterType: 'date'
  condition1: IDateFilterCondition
  condition2?: IDateFilterCondition
  operator?: 'AND' | 'OR'
}
