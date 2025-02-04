// Traduit du schema de SIAF RNF
import { PersonRoleKey } from '../person-role.enums';
import {FoundationTypeKey} from './foundation-type.enum'
import { IAddress, IDissolved, IStatus } from './siaf-common-output.interface';

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

interface Person  {
  civility:string | undefined
  lastName:string
  firstName:string
  email:string | undefined
  phone:string | undefined
  profession:string
  nationality:string
  bornAt: Date
  bornPlace:string | undefined
  isFounder:boolean
  role: PersonRoleKey
  address: IAddress
  residenceCountry: string;
  entryDate?: Date;
  exitDate?: Date;
  jobPosition: string;

}

export interface ISiafRnfOutput {
  id: string
  title: string
  email: string
  phone: string
  websites: string[]
  foundationType: FoundationTypeKey
  department: string
  originalDepartment: string
  originalCreatedAt: Date
  dissolved: IDissolved
  status: IStatus | undefined
  address: IAddress | undefined
  fiscalEndDateAt: Date | null
  declarationYears: number[]
  persons: Person[]
  objectDescription?: string
  dueDate?: Date
  generalInterest?: string
  internationalAction?: boolean
  createdAt: Date
  updatedAt: Date
}
