import { type FileMimeTypeKey, eFileMimeType, type StateKey } from '@biblio-num/shared'

const mimeTypeIconDictionary:Record<FileMimeTypeKey, string> = {
  [eFileMimeType.pdf]: 'vi-file-type-pdf2',
  [eFileMimeType.doc]: 'vi-file-type-word2',
  [eFileMimeType.docx]: 'vi-file-type-word2',
  [eFileMimeType.xls]: 'vi-file-type-excel2',
  [eFileMimeType.xlsx]: 'vi-file-type-excel2',
  [eFileMimeType.png]: 'vi-file-type-image',
  [eFileMimeType.jpeg]: 'vi-file-type-image',
  [eFileMimeType.jpg]: 'vi-file-type-image',
  [eFileMimeType.unknown]: 'ri-attachment-line',
}

export function getIconNameFromMimeType (mimeType?: FileMimeTypeKey) {
  return mimeTypeIconDictionary[mimeType ?? 'unknown']
}

export const getIconPropsFromFileState = (state: StateKey) => {
  return statesDict[state]
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
