import { ISiafAddress, IDissolved, IFile, IStatus } from "./siaf-common-output.interface";

interface ICategoryObjectSocial {
  code: string;
  descriptions: string[];
}

interface IObjetSocial {
  description: string;
  categories: ICategoryObjectSocial[];
}

interface IRnaAdrgAddress {
  declarant: string | null;
  complemid: string | null;
  complemgeo: string | null;
  libvoie: string | null;
  distrib: string | null;
  codepostal: string | null;
  achemine: string | null;
  pays: string | null;
}

interface IRnaAdrsAddress {
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
interface IRnaAddress {
  kind: string;
  address: IRnaAdrgAddress | IRnaAdrsAddress;
}
interface IAddressRna extends ISiafAddress {
  rnaAddress?: IRnaAddress;
}

interface IDirectors {
  file: IFile | null;
}

interface IGroupement {
  type: string;
  associations: string[];
}

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
