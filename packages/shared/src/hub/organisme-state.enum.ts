import { createEnum } from 'factories'

export const organismeStateArray = [
  'Active',
  'Suspendue',
  'Transformée',
  'Fusionnée',
  'Scindée',
  'Dissoute',
] as const

export type organismeStateArrayKey = (typeof organismeStateArray)[number]
export const EOrganismeState = createEnum(organismeStateArray)
