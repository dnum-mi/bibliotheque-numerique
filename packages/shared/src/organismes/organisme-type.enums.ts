import { createEnum } from '../factories'

export const organismeTypes = [
  'unknown',
  'FDD',
  'FE',
  'FRUP',
  'ASSO'
] as const

export type OrganismeTypeKey = (typeof organismeTypes)[number]

export const eOrganismeType = createEnum(organismeTypes)

export const dOrganismeTypeDictionary: Record<OrganismeTypeKey, string> = {
  [eOrganismeType.ASSO]: 'ASSO',
  [eOrganismeType.FDD]: 'FDD',
  [eOrganismeType.FE]: 'FE',
  [eOrganismeType.FRUP]: 'FRUP',
  [eOrganismeType.unknown]: 'Inconnu',
}
