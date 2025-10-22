import { createEnum } from 'factories'

export const organismeStatusArray = [
  'Active',
  'Suspendue',
  'Transformée',
  'Fusionnée',
  'Scindée',
  'Dissoute',
] as const

export type OrganismeStatusKey = (typeof organismeStatusArray)[number]
export const eOrganismeStatus = createEnum(organismeStatusArray)
