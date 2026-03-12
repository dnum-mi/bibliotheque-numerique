import { createEnum } from 'factories'

export const organismeTypeToSeachArray = [
  'fondations',
  'associations',
  'all'
] as const

export type OrganismeTypeToSearchKey = (typeof organismeTypeToSeachArray)[number]
export const eOrganismeTypeToSearch = createEnum(organismeTypeToSeachArray)
