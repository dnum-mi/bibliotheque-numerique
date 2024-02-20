import {
  ISmallDemarcheOutput,
  OrganismeTypeKeys,
  IdentificationDemarcheKeys,
} from '@biblio-num/shared'

export class SmallDemarcheOutputDto implements ISmallDemarcheOutput {
  id: number
  title: string
  types: OrganismeTypeKeys[]
  dsId: number
  identification?: IdentificationDemarcheKeys | undefined
}
