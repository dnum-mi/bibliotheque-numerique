import { createEnum } from 'factories'

export const qualityInOrganismeArray = [
  'Membre du conseil de surveillance',
  'Membre du directoire',
  "Membre du conseil d'administration",
  'Personne exerçant des fonctions de direction',
] as const

export type qualityInOrganismeKey = (typeof qualityInOrganismeArray)[number]
export const eQualityInOrganisme = createEnum(qualityInOrganismeArray)
