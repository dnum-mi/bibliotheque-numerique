import { createEnum } from 'factories'

// JobPosition dans le RAF
export const jobPositionArray = [
  'Président',
  'Trésorier',
  'Secrétaire',
  'Vice président',
] as const

export type JobPositionKey = (typeof jobPositionArray)[number]
export const eJobPosition = createEnum(jobPositionArray)
