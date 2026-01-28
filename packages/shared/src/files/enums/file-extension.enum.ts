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

export type KnownFileExtensionKey = Exclude<FileExtensionKey, 'unknown'>

export const mimTypeToExtensionMap: Record<string, KnownFileExtensionKey> = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
} as const

export const getExtensionFromMimeType = (
  mimeType?: string,
): KnownFileExtensionKey | null => {
  if (!mimeType) {
    return null
  }

  return mimTypeToExtensionMap[mimeType] || null
}
