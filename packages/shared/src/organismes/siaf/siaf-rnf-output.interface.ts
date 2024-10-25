// Traduit du schema de SIAF RNF
import { PersonRoleKey } from '../person-role.enums';
import {FoundationTypeKey} from './foundation-type.enum'

enum eFileMimeType {
  unknown = "unkown", // TODO: do we want to authorize any file type ?
  png = "image/png",
  jpg = "image/jpeg",
  pdf = "application/pdf",
  xlsx= "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls = "application/vnd.ms-excel",
  doc = "application/msword",
  docx= "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

interface File {
  id: string
  name: string
  checksum: string
  byteSize: number
  mimeType: string //eFileMimeType;
}
interface Dissolved {
  dissolvedAt: Date | undefined;
  verbalProcess: File | undefined;
  mandatLetter: File | undefined;
  otherFiles: File[]
}
interface Status {
  file: File | undefined
}

interface GouvAddress {
  label: string
  housenumber: string | undefined
  id: string | undefined
  banId: string | undefined
  name: string | undefined
  postcode: string | undefined
  citycode: string | undefined
  context: string | undefined
  type: string | undefined
  street: string | undefined
  city: string | undefined;
}

interface Address {
  dsStringValue: string | undefined;
  coordinates: [number, number] | undefined;
  gouvAddress: GouvAddress | undefined;
}

interface Person  {
  civility:string | undefined
  lastName:string
  firstName:string
  email:string | undefined
  phone:string | undefined
  profession:string
  nationality:string
  bornAt: Date | undefined
  bornPlace:string | undefined
  isFounder:boolean
  role: PersonRoleKey
  address: Address
}

export interface ISiafRnfOutput {
  id: string
  title: string
  email: string
  phone: string
  websites: string[]
  foundationType: FoundationTypeKey
  department: string
  originalCreatedAt: Date
  dissolved: Dissolved
  status: Status | undefined
  address: Address | undefined
  fiscalEndDateAt: Date | null
  declarationYears: number[]
  persons: Person[]
}
