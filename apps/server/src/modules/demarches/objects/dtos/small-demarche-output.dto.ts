import {
  ISmallDemarcheOutput,
  OrganismeTypeKey,
  IdentificationDemarcheKeys,
} from '@biblio-num/shared'

export class SmallDemarcheOutputDto implements ISmallDemarcheOutput {
  id: number
  title: string
  types: OrganismeTypeKey[]
  dsId: number
  identification?: IdentificationDemarcheKeys | undefined
}
