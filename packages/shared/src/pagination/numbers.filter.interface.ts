export interface INumbersFilterCondition {
  includeEmpty: boolean
  filter: number[]
}

export interface IFilterNumbers {
  filterType: 'numbers'
  condition1: INumbersFilterCondition
}
