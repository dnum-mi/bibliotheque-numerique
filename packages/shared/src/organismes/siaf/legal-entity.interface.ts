import { ISiafAddress } from "./common-output.interface"
import { OrganismeKind } from "./enums/organimse-kind.enum"

export type LegalEntityType = OrganismeKind | 'Entreprise' | string

export interface ILegalEntity {
  type: LegalEntityType
  publicId: string | null
  name: string | null
  address: ISiafAddress | null
  country: string | null
}
