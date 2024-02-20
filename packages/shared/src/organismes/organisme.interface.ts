import type { OrganismeTypeKeys } from './organisme-type.enums'
import type { IRnaOutput } from './rna-output.interface'
import type { IRnfOutput } from './rnf-output.interface'

export interface IOrganisme {
  id: number
  type: OrganismeTypeKeys
  title: string
  email: string
  phoneNumber: string
  dateCreation: Date
  dateDissolution?: Date | null
  idRna: string | null
  rnaJson: IRnaOutput | null
  idRnf: string | null
  rnfJson: IRnfOutput | null

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
}
