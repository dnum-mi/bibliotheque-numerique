import { createEnum } from "../factories"

export const organismeTypes = [
  'unknown',
  'FDD',
  'FE',
  'FRUP',
  'ARUP',
  'CULTE',
] as const

export type OrganismeTypeKey = (typeof organismeTypes)[number]

export const eOrganismeType = createEnum(organismeTypes)

export const dOrganismeTypeDictionary: Record<OrganismeTypeKey, string> = {
  [eOrganismeType.ARUP]: 'ARUP',
  [eOrganismeType.CULTE]: 'CULTE',
  [eOrganismeType.FDD]: 'FDD',
  [eOrganismeType.FE]: 'FE',
  [eOrganismeType.FRUP]: 'FRUP',
  [eOrganismeType.unknown]: 'Inconnu',
}
