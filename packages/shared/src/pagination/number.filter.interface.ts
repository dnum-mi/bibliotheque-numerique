export const NumberFilterConditions = {
  Equals: 'equals',
  NotEqual: 'notEqual',
  LessThan: 'lessThan',
  LessThanOrEqual: 'lessThanOrEqual',
  GreaterThan: 'greaterThan',
  GreaterThanOrEqual: 'greaterThanOrEqual',
}

export type NumberFilterConditionsKeys =
  (typeof NumberFilterConditions)[keyof typeof NumberFilterConditions]

export interface INumberFilterCondition {
  type: NumberFilterConditionsKeys
  filter: number
  filterTo?: number
}

export interface IFilterNumber {
  filterType: 'number'
  condition1: INumberFilterCondition
  condition2?: INumberFilterCondition
  operator?: 'AND' | 'OR'
}
