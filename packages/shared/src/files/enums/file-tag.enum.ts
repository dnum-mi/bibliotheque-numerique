import { createEnum } from '../../factories'

export const fileTabTags = [
  'status',
  'account',
] as const

export type FileTabTagKey = (typeof fileTabTags)[number]
export const eFileTabTag = createEnum(fileTabTags)

export const dFileTabTagDictionary: Record<FileTabTagKey, string> = {
  [eFileTabTag.status]: 'Status',
  [eFileTabTag.account]: 'Dépôt de compte',
}

export const fileTags = [
  ...fileTabTags,
  'excel-fe',
] as const

export type FileTagKey = (typeof fileTags)[number]
export const eFileTag = createEnum(fileTags)

export const dFileTagDictionary: Record<FileTagKey, string> = {
  ...dFileTabTagDictionary,
  [eFileTag['excel-fe']]: 'Excel Financement < 15000',
}
