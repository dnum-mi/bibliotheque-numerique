import type { OrganismeTypeKey } from '../organismes'
import type { IdentificationDemarcheKeys } from './identification-demarches'

export interface IUpdateDemarche {
  identification?: IdentificationDemarcheKeys | null
  types?: OrganismeTypeKey[]
}
