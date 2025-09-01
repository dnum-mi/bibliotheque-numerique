import type { OrganismeTypeKey } from '../organismes'
import type { IdentificationDemarcheKey } from './identification-demarches'

export interface IUpdateDemarche {
  identification?: IdentificationDemarcheKey | null
  types?: OrganismeTypeKey[]
}
