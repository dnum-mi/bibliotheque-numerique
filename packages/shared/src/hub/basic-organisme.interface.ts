import { organismeStateArrayKey } from './organisme-state.enum'
import { FoundationTypeKey } from '../organismes/siaf/enums/foundation-type.enum'

export interface IBasicOrganisme {
  id: string
  type: FoundationTypeKey | "ASSO"
  title: string
  state: organismeStateArrayKey
  city: string
  postalCode: string
}
