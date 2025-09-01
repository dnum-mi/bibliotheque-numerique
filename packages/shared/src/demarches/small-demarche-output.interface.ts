import type { OrganismeTypeKey } from '../organismes'
import type { IDemarche } from './demarche.interface'
import type { IdentificationDemarcheKey } from './identification-demarches'

export interface ISmallDemarcheOutput extends Partial<IDemarche> {
  id: number
  title: string
  types: OrganismeTypeKey[]
  dsId: number
  identification?: IdentificationDemarcheKey | undefined
  dsCreatedAt: Date
  dsPublishedAt: Date
}
