import type { OrganismeTypeKeys } from '../organismes'
import type { IdentificationDemarcheKeys } from './identification-demarches'

export interface IUpdateDemarche {
  identification?: IdentificationDemarcheKeys | null
  types?: OrganismeTypeKeys[]
}
