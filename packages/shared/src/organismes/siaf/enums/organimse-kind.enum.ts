import { createEnum } from 'factories'

export const organismeKindArray = [
  'Foundation',
  'Association',
] as const

export type OrganismeKind = (typeof organismeKindArray)[number]
export const eOrganismeKind = createEnum(organismeKindArray)
