import { createEnum } from '../../factories'

const fileTags = [
  'status',
  'account',
  'excel-fe',
] as const

export type FileTagKey = (typeof fileTags)[number]

export const eFileTag = createEnum(fileTags)
