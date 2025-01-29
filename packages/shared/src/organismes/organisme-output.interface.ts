import { IOrganisme } from "./organisme.interface";
import { ISiafAssociationOutput, ISiafFondationOutput } from "./hub-output.interface";

export enum  typeCategorieOrganisme {
  rna,
  rnf,
  unknown
}
export interface  IOrganismeOutput {
  bn: Partial<IOrganisme>,
  siaf: Partial<ISiafAssociationOutput | ISiafFondationOutput>
  type: typeCategorieOrganisme
}
