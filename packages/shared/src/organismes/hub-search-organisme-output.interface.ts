export enum EEntityTypeSearchOrganisme {
  Association = "association",
  Fondation = "fondation"
}

export interface ISiafSearchOrganismeResponseOutput {
  score: number;
  entity_type: EEntityTypeSearchOrganisme;
  entity: ISiafFondationEntity | ISiafAssociationEntity;
}

export interface ISiafAssociationEntity {
  id: string;
  title: string;
  objectDescription: string;
  nature: string;
  emails: string[];
  phones: string[];
  websites: string[];
  siret: string | null;
  createdAt: string;
  updatedAt: string;
  dissolved: DissolvedAssociation;
  addresses: AssociationAddress[];
}

export interface ISiafFondationEntity {
  id: string;
  title: string;
  email: string;
  phone: string;
  foundationType: string;
  department: string;
  originalDepartment: string;
  createdAt: string;
  updatedAt: string;
  originalCreatedAt: string;
  fiscalEndDateAt: string;
  declarationYears: string[];
  dissolved: Dissolved;
  status: Status;
  address: FondationAddress;
  persons: Person[];
  objectDescription: string;
  generalInterest: string;
  internationalAction: boolean;
  version: number;
  previous_versions: [];
}

export interface FondationAddress {
  dsStringValue: string;
  coordinates: [number | null, number | null];
}

export interface AssociationAddress {
  coordinates: [number | null, number | null];
  rnaAddress: {
    kind: string;
    address: {
      declarant: string;
      complemid: string;
      complemgeo: string;
      libvoie: string;
      distrib: string;
      codepostal: string;
      achemine: string;
      pays: string;
    };
  };
}

export interface Dissolved {
  otherFiles: string[];
}

export interface DissolvedAssociation {
  dissolvedAt: string | null;
  file: string | null;
}

export interface Status {
  file: FileData;
}

export interface FileData {
  id: string;
  name: string;
  checksum: string;
  byteSize: number;
  mimeType: string;
}

export interface Person {
  lastName: string;
  firstName: string;
  profession: string;
  nationality: string;
  bornAt: string;
  isFounder: boolean;
  role: string;
  residenceCountry: string;
  entryDate: string;
  jobPosition: string;
  address: PersonAddress;
}

export interface PersonAddress {
  dsStringValue: string;
  coordinates: [number | null, number | null];
  dsAddress: DsAddress;
  gouvAddress: GouvAddress;
}

export interface DsAddress {
  label: string;
  type: string;
  streetAddress: string;
  streetNumber: string;
  streetName: string;
  postalCode: string;
  cityName: string;
  cityCode: string;
  departmentName: string;
  departmentCode: string;
  regionName: string;
  regionCode: string;
}

export interface GouvAddress {
  label: string;
  housenumber: string;
  name: string;
  postcode: string;
  citycode: string;
  city: string;
  context: string;
  type: string;
  street: string;
}

export interface ISiafSearchOrganismeOutput {
  sentence: string;
  search_response: ISiafSearchOrganismeResponseOutput[];
}
