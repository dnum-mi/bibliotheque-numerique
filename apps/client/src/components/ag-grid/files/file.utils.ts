import { eFileExtension } from '@biblio-num/shared'
import type { FileExtensionKey, StateKey } from '@biblio-num/shared'

const mimeTypeIconDictionary: Record<FileExtensionKey, string> = {
  [eFileExtension.pdf]: 'vi-file-type-pdf2',
  [eFileExtension.doc]: 'vi-file-type-word2',
  [eFileExtension.docx]: 'vi-file-type-word2',
  [eFileExtension.xls]: 'vi-file-type-excel2',
  [eFileExtension.xlsx]: 'vi-file-type-excel2',
  [eFileExtension.png]: 'vi-file-type-image',
  [eFileExtension.jpeg]: 'vi-file-type-image',
  [eFileExtension.jpg]: 'vi-file-type-image',
  [eFileExtension.unknown]: 'ri-attachment-line',
}

export function getIconNameFromMimeType (mimeType?: FileExtensionKey) {
  return mimeTypeIconDictionary[mimeType ?? 'unknown']
}

export const statesDict: Record<StateKey, {
  name: string
  fill: string
  title: string
}> = {
  queued: {
    name: 'fa-hourglass-half',
    fill: 'var(--info-425-625)',
    title: 'En attente de téléversement',
  },
  uploading: {
    name: 'fa-hourglass-half',
    fill: 'var(--green-archipel-sun-391-moon-716)',
    title: 'En cours de téléversement...',
  },
  failed: {
    name: 'ri-close-circle-line',
    fill: 'var(--error-425-625)',
    title: 'Échec du téléversement',
  },
  uploaded: {
    name: 'ri-checkbox-circle-line',
    fill: 'var(--success-425-625)',
    title: 'Téléversé',
  },
}

export const getIconPropsFromFileState = (state: StateKey) => {
  return statesDict[state]
}
