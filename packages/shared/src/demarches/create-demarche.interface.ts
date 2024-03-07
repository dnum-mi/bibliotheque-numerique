import type { OrganismeTypeKey } from '../organismes'
import type { IdentificationDemarcheKeys } from './identification-demarches'

export interface ICreateDemarche {
  idDs: number
  identification: IdentificationDemarcheKeys
  types: OrganismeTypeKey[]
}
