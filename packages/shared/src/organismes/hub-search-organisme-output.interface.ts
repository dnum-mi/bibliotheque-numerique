import { ISiafRnaOutput } from "./siaf/siaf-rna-output.interface";
import { ISiafRnfOutput } from "./siaf/siaf-rnf-output.interface";

export enum EEntityTypeSearchOrganisme {
  Association = "association",
  Fondation = "fondation"
}

export interface ISiafSearchOrganismeResponseOutput {
  score: number;
  entity_type: EEntityTypeSearchOrganisme;
  entity: ISiafRnaOutput | ISiafRnfOutput
}

export interface ISiafSearchOrganismeOutput {
  sentence: string;
  search_response: ISiafSearchOrganismeResponseOutput[];
}
