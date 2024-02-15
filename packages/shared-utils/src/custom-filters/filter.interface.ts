export interface IFilter<T> {
  type: string
  condition1: T
  condition2: T
  operator: 'OR' | 'AND'
}
