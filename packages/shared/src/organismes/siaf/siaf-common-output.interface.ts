
export interface IFile {
  id: string;
  name: string;
  checksum: string;
  byteSize: number;
  mimeType: string; //eFileMimeType;
}

export interface IDissolved {
  dissolvedAt: Date | undefined;
  verbalProcess: IFile | undefined;
  mandatLetter: IFile | undefined;
  otherFiles: IFile[];
}
interface IGouvAddress {
  label: string;
  housenumber: string | undefined;
  id: string | undefined;
  banId: string | undefined;
  name: string | undefined;
  postcode: string | undefined;
  citycode: string | undefined;
  context: string | undefined;
  type: string | undefined;
  street: string | undefined;
  city: string | undefined;
}

interface IDsAddress {
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

export interface IAddress {
  dsStringValue: string | undefined;
  coordinates: [number, number] | undefined;
  dsAddress?: IDsAddress
  gouvAddress: IGouvAddress | undefined;
}
export interface IStatus {
  file: IFile | undefined;
}
