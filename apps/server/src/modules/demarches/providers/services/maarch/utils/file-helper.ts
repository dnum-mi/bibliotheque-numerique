import { FileRawValue } from '@/modules/demarches/objects/constants/maarch.types'
import { eFileExtension, FileExtensionKey } from '@biblio-num/shared'
import { createHash } from 'crypto'

export const _extractExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.')

  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return ''
  }

  return filename.substring(lastDotIndex)
}

export const generateChecksum = (label: string): string => {
  if (!label) {
    return 'unknown'
  }

  const hash = createHash('sha256')
  hash.update(label)
  return hash.digest('hex')
}

export const extractMimeType = (label: string): FileExtensionKey => {
  if (!label) {
    return eFileExtension.unknown
  }

  const extension = _extractExtension(label).toLowerCase()
  const extensionWithoutDot = extension.startsWith('.')
    ? extension.substring(1)
    : extension

  const extensionMap: { [key: string]: FileExtensionKey } = {
    pdf: eFileExtension.pdf,
    png: eFileExtension.png,
    jpg: eFileExtension.jpg,
    jpeg: eFileExtension.jpeg,
    doc: eFileExtension.doc,
    docx: eFileExtension.docx,
    xls: eFileExtension.xls,
    xlsx: eFileExtension.xlsx,
  }

  return extensionMap[extensionWithoutDot] || eFileExtension.unknown
}

export const createFileRawValue = (file: {
    nom?: string
    url?: string
  }): FileRawValue => {
  return {
    byteSizeBigInt: '0',
    checksum: generateChecksum(file.nom || ''),
    contentType: extractMimeType(file.nom || ''),
    filename: file.nom || 'unknown',
    url: file.url || '',
  }
}
