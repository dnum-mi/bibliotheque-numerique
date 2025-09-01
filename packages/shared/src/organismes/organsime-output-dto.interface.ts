import { ISyncState } from "../state";
import { IOrganisme } from "./organisme.interface";

export interface IOrganismeOutputDto extends IOrganisme {
  sigle?: string;
  siret?: string;

  siege: {
    coordinates?: [number, number];
    prefecture: string;
    isVerified: boolean;
  }
  gestion?: {
    addressLabel: string;
    coordinates?: [number, number];
    prefecture: string;
    isVerified: boolean;
  }
  websites?: string;
  objectDescription?: string;
  dueDate?: Date;
  generalInterest?: string;
  internationalAction?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  fiscalEndDateAt?: Date;
  syncState: ISyncState & { id: number};
}
