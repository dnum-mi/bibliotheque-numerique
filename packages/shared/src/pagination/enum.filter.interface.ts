export interface IEnumFilterCondition {
  type?: undefined
  filter: string[]
}

export interface IFilterEnum {
  filterType: 'set'
  condition1: IEnumFilterCondition
  condition2?: undefined
  operator?: undefined
}
