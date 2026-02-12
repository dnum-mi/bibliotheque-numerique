import { createEnum } from 'factories'

// JobPosition dans le RAF
export const jobPositionArray = [
  'Président',
  'Trésorier',
  'Secrétaire',
  'Vice président',
  'Administrateur',
  'Directeur'
] as const

export type JobPositionKey = (typeof jobPositionArray)[number]
export const eJobPosition = createEnum(jobPositionArray)

export const jobPositionPriority: Record<JobPositionKey, number> = {
  'Président': 1,
  'Vice président': 2,
  'Trésorier': 3,
  'Secrétaire': 4,
  'Administrateur': 5,
  'Directeur': 6
}

export const getJobPositionWeight = (job: JobPositionKey | null | undefined) => {
  if (!job) {
    return 99
  }
  return jobPositionPriority[job] || 99
}
