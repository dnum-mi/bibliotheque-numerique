import { IDemarche } from '../../interfaces'
import { IdentificationDemarcheKeys, OrganismeTypeKeys } from '../../enums'

export class SmallDemarcheOutputDto implements Partial<IDemarche> {
  id: number
  title: string
  types: OrganismeTypeKeys[]
  dsId: number
  identification?: IdentificationDemarcheKeys | undefined
}
