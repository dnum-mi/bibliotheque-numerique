import { IOrganisme } from "./organisme.interface";
import { ISiafRnaOutput } from "./siaf/siaf-rna-output.interface";
import { ISiafRnfOutput } from "./siaf/siaf-rnf-output.interface";

export enum  typeCategorieOrganisme {
  rna,
  rnf,
  unknown
}
export interface  IOrganismeOutput {
  bn: Partial<IOrganisme>,
  siaf: Partial<ISiafRnaOutput | ISiafRnfOutput>
  type: typeCategorieOrganisme
}
