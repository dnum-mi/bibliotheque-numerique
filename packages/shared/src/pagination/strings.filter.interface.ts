export interface IStringsFilterCondition {
  includeEmpty: boolean
  filter: string[]
}

export interface IFilterStrings {
  filterType: 'strings'
  condition1: IStringsFilterCondition
}

export interface IStringsFilterModel {
  filterType: 'strings';
  includeEmpty: boolean;
  filter: string[];
}
