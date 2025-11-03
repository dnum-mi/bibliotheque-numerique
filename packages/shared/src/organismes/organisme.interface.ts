import type { StateKey } from '../state'
import type { OrganismeTypeKey } from './organisme-type.enums'
import type { IRnaOutput } from './rna-output.interface'
import {
  IAssociationOutput,
  IFoundationOutput,
  IPerson
} from './siaf'

//TODO: a revoir aprés la connection avec le hub défnitif
export interface IOrganisme {
  id: number
  type: OrganismeTypeKey
  state: StateKey
  title: string | null
  email: string | null
  phoneNumber: string | null
  dateCreation: Date | null
  dateDissolution?: Date | null
  idRna: string | null
  rnaJson: IRnaOutput | IAssociationOutput | null
  idRnf: string | null
  rnfJson: IFoundationOutput |null
  addressLabel: string | null
  addressPostalCode: string | null
  addressCityName: string | null
  addressType: string | null
  addressStreetAddress: string | null
  addressStreetNumber: string | null
  addressStreetName: string | null
  addressDepartmentName: string | null
  addressDepartmentCode: string | null
  addressRegionName: string | null
  addressRegionCode: string | null
  declarationYears: number[]
  missingDeclarationYears: number[]
  persons: IPerson[]
}
