export const TextFilterConditions = {
  Contains: 'contains',
  NotContains: 'notContains',
  StartsWith: 'startsWith',
  EndsWith: 'endsWith',
  Blank: 'blank',
  NotBlank: 'notBlank',
}

export type TextFilterConditionsKeys =
  (typeof TextFilterConditions)[keyof typeof TextFilterConditions]

export interface ITextFilterCondition {

  type: TextFilterConditionsKeys

  filter?: string
}

export interface IFilterText {
  filterType: 'text'
  condition1: ITextFilterCondition
  condition2?: ITextFilterCondition
  operator?: 'AND' | 'OR'
}
