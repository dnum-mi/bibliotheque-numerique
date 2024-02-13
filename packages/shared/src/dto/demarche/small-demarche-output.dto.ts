import { IDemarche } from '../../interfaces'
import { IdentificationDemarcheKeys } from '../../enums'
import { OrganismeTypeKeys } from '@biblio-num/shared-utils'

export class SmallDemarcheOutputDto implements Partial<IDemarche> {
  id: number
  title: string
  types: OrganismeTypeKeys[]
  dsId: number
  identification?: IdentificationDemarcheKeys | undefined
}
