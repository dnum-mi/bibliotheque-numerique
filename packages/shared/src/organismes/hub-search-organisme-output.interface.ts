import { IAssociationOutput, IFoundationOutput } from "./siaf";

export enum EEntityTypeSearchOrganisme {
  Association = "association",
  Fondation = "fondation"
}

export interface ISiafSearchOrganismeResponseOutput {
  score: number;
  entity_type: EEntityTypeSearchOrganisme;
  entity: IAssociationOutput | IFoundationOutput
}

export interface ISiafSearchOrganismeOutput {
  sentence: string;
  search_response: ISiafSearchOrganismeResponseOutput[];
}
