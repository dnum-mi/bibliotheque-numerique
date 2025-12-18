import { organismeCategoryKey } from './organisme-category.enum'
import { IBasicOrganisme } from './basic-organisme.interface'

export interface ISiafSearchOrganismeOneOutput {
  score: number;
  entity_type: organismeCategoryKey;
  entity: IBasicOrganisme
}

export interface ISiafSearchOrganismeOutput {
  sentence: string
  search_response: ISiafSearchOrganismeOneOutput[]
}
