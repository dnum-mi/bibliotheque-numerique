import { createEnum } from '../../factories'

// all tags here create tab in organisme page
export const fileTags = [
  'status',
  'account',
  'pv',
  'judgment',
  'activityReport',
  'fe'
] as const

export type FileTagKey = (typeof fileTags)[number]
export const eFileTag = createEnum(fileTags)

export const dFileTabDictionary: Record<FileTagKey, string> = {
  [eFileTag.status]: 'Statuts',
  [eFileTag.account]: 'Comptes',
  [eFileTag.pv]: 'Procès verbal',
  [eFileTag.judgment]: 'Jugement',
  [eFileTag.activityReport]: 'Rapport d\'activité',
  [eFileTag.fe]: 'Financement étranger',
}
