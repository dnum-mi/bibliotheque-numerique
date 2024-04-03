import {
  ISmallDemarcheOutput,
  OrganismeTypeKey,
  IdentificationDemarcheKey,
} from '@biblio-num/shared'

export class SmallDemarcheOutputDto implements ISmallDemarcheOutput {
  id: number
  title: string
  types: OrganismeTypeKey[]
  dsId: number
  identification?: IdentificationDemarcheKey | undefined
  dsCreatedAt: Date
  dsPublishedAt: Date
}
