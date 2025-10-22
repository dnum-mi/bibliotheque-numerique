import { createEnum } from 'factories'

export const jobPositionArray = [
  'Membre du conseil de surveillance',
  'Membre du directoire',
  "Membre du conseil d'administration",
  'Personne exerçant des fonctions de direction',
] as const

export type JobPositionKey = (typeof jobPositionArray)[number]
export const eJobPosition = createEnum(jobPositionArray)
