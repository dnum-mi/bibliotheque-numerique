import {
  ISmallDemarcheOutput,
  OrganismeTypeKeys,
  IdentificationDemarcheKeys,
} from '@biblio-num/shared-utils'

export class SmallDemarcheOutputDto implements ISmallDemarcheOutput {
  id: number
  title: string
  types: OrganismeTypeKeys[]
  dsId: number
  identification?: IdentificationDemarcheKeys | undefined
}
