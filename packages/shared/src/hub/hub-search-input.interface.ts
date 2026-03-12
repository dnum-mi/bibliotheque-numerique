import { OrganismeTypeToSearchKey } from "./hub-organimse-type-to-search.enum";

export interface ISearchHubConditionInput {
  field: string,
  operator: string,
  inValues: unknown | null,
  singleValue: unknown | null,
}

export interface ISearchHubInput {
  sentence: string,
  size?: number | null,
  entityType?: OrganismeTypeToSearchKey | null,
  conditions?: ISearchHubConditionInput[],
}
