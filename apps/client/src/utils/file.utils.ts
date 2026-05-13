import { getExtensionFromMimeType } from '@biblio-num/shared'
import type { IFile, RnaTypeFileKey, RnaTypeRecepisseKey, TypeFileKey } from '@biblio-num/shared'
import { dateToStringFr } from './date-to-string'
import type { AxiosResponse } from 'axios'

export interface NormalizedFile {
  blob: Blob
  filename: string
  mimeType: string
}

export const getFileFormat = (mimeType: string): string => {
  switch (mimeType) {
    case 'application/pdf':
      return 'PDF'
    case 'application/zip':
      return 'ZIP'
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'DOCX'
    case 'application/msword':
      return 'DOC'
    case 'image/jpeg':
      return 'JPEG'
    case 'image/png':
      return 'PNG'
    default:
      return mimeType.split('/')[1]?.toUpperCase() || 'FICHIER'
  }
}

export const formatBytes = (bytes: number, decimals = 1): string => {
  if (!bytes || bytes === 0) {
    return ''
  }
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(dm)).toLocaleString('fr-FR')} ${sizes[i]}`
}

export const getFileDetail = (file: IFile): string => {
  let type: TypeFileKey | RnaTypeFileKey | RnaTypeRecepisseKey | 'Document' | null = file.typeFile
  if (!type && file.rnaFile) {
    type = file.rnaFile.typePiece || file.rnaFile.typeRecepisse
  }
  if (!type) {
    type = 'Document' // Fallback
  }

  const date = file.effectiveAt ? dateToStringFr(file.effectiveAt) : null
  return date ? `${type} - ${date}` : type
}

export const extractFilename = (contentDisposition: string | undefined, fallbackName: string): string => {
  if (!contentDisposition) {
    return fallbackName
  }

  const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
  if (filenameMatch?.[1]) {
    return filenameMatch[1]
  }

  return fallbackName
}

export const ensureExtension = (filename: string, mimeType?: string): string => {
  if (/\.[a-z0-9]{2,5}$/i.test(filename) || !mimeType) {
    return filename
  }

  const extension = getExtensionFromMimeType(mimeType)

  return extension ? `${filename}.${extension}` : filename
}

export const normalizeFileResponse = (
  response: AxiosResponse,
  fallbackName: string,
  fallbackMimeType: string = 'application/octet-stream',
): NormalizedFile => {
  const headers = response.headers ?? {}

  const mimeType: string = headers['content-type']?.toString() || fallbackMimeType
  const contentDisposition: string | undefined = headers['content-disposition']

  let filename = extractFilename(contentDisposition, fallbackName)
  filename = ensureExtension(filename, mimeType)

  const blob = new Blob([response.data], { type: mimeType })

  return {
    blob,
    filename,
    mimeType,
  }
}
