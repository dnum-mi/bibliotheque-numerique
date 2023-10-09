import { IDemarche } from '../../interfaces'
import { OrganismeTypeKeys } from '../../enums'

export class SmallDemarcheOutputDto implements Partial<IDemarche> {
  id: number
  title: string
  types: OrganismeTypeKeys[]
  dsId: number
}
