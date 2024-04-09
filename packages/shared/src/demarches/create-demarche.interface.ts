import type { OrganismeTypeKey } from '../organismes'
import type { IdentificationDemarcheKey } from './identification-demarches'

export interface ICreateDemarche {
  idDs: number
  identification: IdentificationDemarcheKey
  types: OrganismeTypeKey[]
}
