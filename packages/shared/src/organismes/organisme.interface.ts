import { ISiafRnfOutput } from './siaf/siaf-rnf-output.interface'
import type { StateKey } from '../state'
import type { OrganismeTypeKey } from './organisme-type.enums'
import { IPerson } from './person-interface'
import type { IRnaOutput } from './rna-output.interface'
import type { IRnfOutput } from './rnf-output.interface'

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
  rnaJson: IRnaOutput | null
  idRnf: string | null
  rnfJson: IRnfOutput | ISiafRnfOutput |null
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
