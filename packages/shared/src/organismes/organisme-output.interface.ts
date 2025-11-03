import { ISyncState } from "../state/sync-state.interface";
import { IOrganisme } from "./organisme.interface";
import { IOrganismeOutputDto } from "./organsime-output-dto.interface";
import {
  IAssociationOutput,
  IFoundationOutput
} from "./siaf";

export enum  typeCategorieOrganisme {
  rna = 'rna',
  rnf ='rnf',
  unknown = 'unknown',
}
//TOOD: en fonctionnement nominal il doit avoir que IOrganismeOutput=IOrganismeOutputDto pour le client
export interface  IOrganismeOutput {
  bn: Partial<IOrganismeOutputDto | IOrganisme>,
  siaf: Partial<IOrganismeOutputDto | IAssociationOutput | IFoundationOutput>
  syncState?: ISyncState,
  dossiersCount?: number,
  type: typeCategorieOrganisme
}
