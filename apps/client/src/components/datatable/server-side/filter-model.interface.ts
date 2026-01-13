/**
 * Types de filtres
 */

export interface SetFilterModel {
  filterType: 'set'
  values: any[]
}

export interface TextFilterModel {
  filterType: 'text'
  type: string
  filter: string
}

export interface NumberFilterModel {
  filterType: 'number'
  type: string
  filter: number
  filterTo?: number
}

export interface DateFilterModel {
  filterType: 'date'
  type: string
  dateFrom: string
  dateTo?: string
}

export interface ICombinedSimpleModel<T> {
  operator: 'AND' | 'OR'
  condition1: T
  condition2: T
  conditions?: T[]
}

export type SimpleFilterModel = SetFilterModel | TextFilterModel | NumberFilterModel | DateFilterModel
export type FilterModel = SimpleFilterModel | ICombinedSimpleModel<SimpleFilterModel>
export type SimpleFilterModelWithoutDate = SetFilterModel | TextFilterModel | NumberFilterModel
