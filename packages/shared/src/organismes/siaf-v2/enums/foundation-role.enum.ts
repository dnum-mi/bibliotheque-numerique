import { createEnum } from 'factories'

export const foundationRoleArray = [
  'Président',
  'Trésorier',
  'Secrétaire',
  'Vice président',
] as const

export type FoundationRoleKey = (typeof foundationRoleArray)[number]
export const eFoundationRole = createEnum(foundationRoleArray)
