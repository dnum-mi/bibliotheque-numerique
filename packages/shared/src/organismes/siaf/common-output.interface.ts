import { PrefixS3Key, RnaTypeFileKey, RnaTypeRecepisseKey, TypeFileKey } from "./enums"

//#region 📍------ Address ------ 📍

//#region 📍------ RNA ------ 📍
export interface IRnaAdrsAddress {
  complement: string | null
  numvoie: string | null
  repetition: string | null
  typevoie: string | null
  libvoie: string | null
  distrib: string | null
  codeinsee: string | null
  codepostal: string | null
  libcommune: string | null
}

export interface IGouvAddress {
  label: string
  housenumber: string | null
  id: string | null
  name: string | null
  postcode: string | null
  citycode: string | null
  city: string | null
  district: string | null
  context: string | null
  type: string | null
  street: string | null
}

export interface IRnaAddress {
  address: IRnaAdrsAddress
  gouvAddress: IGouvAddress
}
//#endregion

export interface IDsAddress {
  cityName: string
  cityCode: string
  label: string
  postalCode: string
  type: string
  countryCode: string | null
  countryName: string | null
  departmentName: string | null
  departmentCode: string | null
  regionName: string | null
  regionCode: string | null
  streetAddress: string | null
  streetNumber: string | null
  streetName: string | null
}

export interface ISiafAddress {
  oneLine: string
  coordinates: [number, number]
  rnaAddress: IRnaAddress | null
  dsAddress: IDsAddress | null
}
//#endregion

//#region 📍------ FILE ------ 📍

//#region 📍------ RNA ------ 📍
export interface IRnaFile {
  typePiece: RnaTypeFileKey | null
  typeRecepisse: RnaTypeRecepisseKey | null
  eventId: string
  uploadedAt: Date
}
//#endregion

