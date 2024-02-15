import type { OrganismeTypeKeys } from '../organismes'
import type { IDemarche } from './demarche.interface'
import type { IdentificationDemarcheKeys } from './identification-demarches'

export interface ISmallDemarcheOutput extends Partial<IDemarche> {
  id: number
  title: string
  types: OrganismeTypeKeys[]
  dsId: number
  identification?: IdentificationDemarcheKeys | undefined
}
