import { createEnum } from '../../factories'

const fileMimeTypes = [
  'unknown', // TODO: do we want to authorize any file type ?
  'png',
  'jpeg',
  'jpg',
  'pdf',
  'xlsx',
  'xls',
  'doc',
  'docx',
] as const

export type FileMimeTypeKey = (typeof fileMimeTypes)[number]

export const eFileMimeType = createEnum(fileMimeTypes)
