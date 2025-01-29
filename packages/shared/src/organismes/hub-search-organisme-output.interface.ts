import { ISiafAssociationOutput, ISiafFondationOutput } from "./hub-output.interface"


export enum EEntityTypeSearchOrganisme {
  association,
  fondation
}
export interface ISiafSearchOrganismeResponseOutput {
  score: number,
  entity_type: EEntityTypeSearchOrganisme,
  entity: ISiafAssociationOutput | ISiafFondationOutput
}
export interface ISiafSearchOrganismeOutput {
  sentence: string,
  search_response: ISiafSearchOrganismeResponseOutput[]
}
