/**
 * @deprecated
 */

import { ISiafAddress, IDissolved, IFile, IStatus } from "./siaf-common-output.interface";

/**
 * @deprecated
 */
interface ICategoryObjectSocial {
  code: string;
  descriptions: string[];
}

/**
 * @deprecated
 */
interface IObjetSocial {
  description: string;
  categories: ICategoryObjectSocial[];
}

/**
 * @deprecated
 */
export interface IRnaAdrgAddress {
  declarant: string | null;
  complemid: string | null;
  complemgeo: string | null;
  libvoie: string | null;
  distrib: string | null;
  codepostal: string | null;
  achemine: string | null;
  pays: string | null;
}

/**
 * @deprecated
 */
export interface IRnaAdrsAddress {
  complement: string | null;
  numvoie: string | null;
  repetition: string | null;
  typevoie: string | null;
  libvoie: string | null;
  distrib: string | null;
  codeinsee: string | null;
  codepostal: string | null;
  libcommune: string | null;
}
/**
 * @deprecated
 */
interface IRnaAddress {
  kind: string;
  address: IRnaAdrgAddress | IRnaAdrsAddress;
}
/**
 * @deprecated
 */
export interface IAddressRna extends ISiafAddress {
  rnaAddress?: IRnaAddress;
}

/**
 * @deprecated
 */
interface IDirectors {
  file: IFile | null;
}

/**
 * @deprecated
 */
interface IGroupement {
  type: string;
  associations: string[];
}

/**
 * @deprecated
 */
export interface ISiafRnaOutput {
  id: string;
  createdAt: Date
  updatedAt: Date
  title: string;
  titles: string[];
  emails: string[];
  phones: string[];
  websites: string[];
  objetSocial: IObjetSocial;
  nature: string;
  siret?: string;
  rnaImportedAt?: Date;
  dissolved: IDissolved;
  addresses: IAddressRna[];
  files: IFile[];
  status: IStatus;
  directors: IDirectors;
  groupement?: IGroupement;
  //TODO: Voire l'utilité
  // office: Office;
  //paperArchive?: string
  //letterIntroduction: string
}

/**
 * @deprecated
 */
export interface ISiafRnaHistoryOutput {
  id: string;
  associationId: string;
  version: number;
  association: ISiafRnaOutput;
  createdAt: Date;
  updatedAt: Date;
  //TODO: Définir le type de l'event
  event?: any
}
