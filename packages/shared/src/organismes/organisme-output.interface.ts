import { ISyncState } from "../state/sync-state.interface";
import { IOrganisme } from "./organisme.interface";
import { IOrganismeOutputDto } from "./organsime-output-dto.interface";
import { ISiafRnaOutput } from "./siaf/siaf-rna-output.interface";
import { ISiafRnfOutput } from "./siaf/siaf-rnf-output.interface";

export enum  typeCategorieOrganisme {
  rna = 'rna',
  rnf ='rnf',
  unknown = 'unknown',
}
//TOOD: en fonctionnement nominal il doit avoir que IOrganismeOutput=IOrganismeOutputDto pour le client
export interface  IOrganismeOutput {
  bn: Partial<IOrganismeOutputDto | IOrganisme>,
  siaf: Partial<IOrganismeOutputDto | ISiafRnaOutput | ISiafRnfOutput>
  syncState?: ISyncState,
  dossiersCount?: number,
  type: typeCategorieOrganisme
}
