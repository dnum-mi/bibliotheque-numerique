import { createEnum } from 'factories'

export const organismeCategoryArray = [
  'association',
  'fondation'
] as const

export type organismeCategoryKey = (typeof organismeCategoryArray)[number]
export const EOrganismeCategory = createEnum(organismeCategoryArray)
