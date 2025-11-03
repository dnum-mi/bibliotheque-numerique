import { createEnum } from '../factories'
import { foundationType } from './siaf'

export const organismeTypes = [
  'unknown',
  'ASSO',
  ...foundationType.filter( (f: string) => f != 'unknown')
] as const

export type OrganismeTypeKey = (typeof organismeTypes)[number]

export const eOrganismeType = createEnum(organismeTypes)


export const dOrganismeTypeDictionary: Record<OrganismeTypeKey, string> = {
  [eOrganismeType.ASSO]: 'ASSO',
  [eOrganismeType.FDD]: 'FDD',
  [eOrganismeType.FE]: 'FE',
  [eOrganismeType.FRUP]: 'FRUP',
  [eOrganismeType.PART]: 'PART',
  [eOrganismeType.SCI]: 'SCI',
  [eOrganismeType.UNI]: 'UNI',
  [eOrganismeType.unknown]: 'Inconnu',
}
