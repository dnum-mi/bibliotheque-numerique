import { createEnum } from '../../factories'

export const fileExtensions = [
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

export type FileExtensionKey = (typeof fileExtensions)[number]

export const eFileExtension = createEnum(fileExtensions)
