import { IOrganisme } from "./organisme.interface";
import { IOrganismeOutputDto } from "./organsime-output-dto.interface";
import { ISiafRnaOutput } from "./siaf/siaf-rna-output.interface";
import { ISiafRnfOutput } from "./siaf/siaf-rnf-output.interface";

export enum  typeCategorieOrganisme {
  rna,
  rnf,
  unknown
}
//TOOD: en fonctionnement nominal il doit avoir que IOrganismeOutput=IOrganismeOutputDto pour le client
export interface  IOrganismeOutput {
  bn: Partial<IOrganismeOutputDto | IOrganisme>,
  siaf: Partial<IOrganismeOutputDto | ISiafRnaOutput | ISiafRnfOutput>
  type: typeCategorieOrganisme
}
