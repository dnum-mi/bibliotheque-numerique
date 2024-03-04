import type { OrganismeTypeKey } from '../organismes'
import type { IDemarche } from './demarche.interface'
import type { IdentificationDemarcheKeys } from './identification-demarches'

export interface ISmallDemarcheOutput extends Partial<IDemarche> {
  id: number
  title: string
  types: OrganismeTypeKey[]
  dsId: number
  identification?: IdentificationDemarcheKeys | undefined
}
