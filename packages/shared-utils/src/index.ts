export const extensions = {
  pdf: 'vi-file-type-pdf2',
  'doc docx msword odt ods': 'vi-file-type-word2',
  'xls xlsx csv vnd.ms-excel vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'vi-file-type-excel2',
  'jpg jpeg png gif tiff tif': 'vi-file-type-image',
  'ppt vnd.ms-powerpoint': 'vi-file-type-powerpoint2',
  default: 'ri-attachment-line',
}

export const getIconNameFromExtension = (ext?: string) => {
  if (ext == null) {
    return extensions.default
  }
  if (getIconNameFromExtension.memo[ext]) {
    return getIconNameFromExtension.memo[ext]
  }
  const icon = Object.entries(extensions).find(([extensions]) => extensions.split(' ').includes(ext))
  const iconName = getIconNameFromExtension.memo[ext] = (icon?.[1] ?? extensions.default)
  return iconName
}
getIconNameFromExtension.memo = {} as Record<string, string>

export const getIconNameFromFilename = (filename: string) => {
  const ext = filename.split('.').at(-1)
  return getIconNameFromExtension(ext)
}

export const getIconNameFromMimeType = (mimeType?: string) => {
  if (mimeType == null) {
    return extensions.default
  }
  if (getIconNameFromExtension.memo[mimeType]) {
    return getIconNameFromExtension.memo[mimeType]
  }
  const mimeType2ndPart = mimeType.split('/')[1]
  const icon = Object.entries(extensions).find(([extensions]) => extensions.split(' ').includes(mimeType2ndPart))
  const iconName = getIconNameFromExtension.memo[mimeType] = (icon?.[1] ?? extensions.default)
  return iconName
}

export const states = {
  queued: {
    name: 'fa-hourglass-half',
    fill: 'var(--info-425-625)',
    title: 'En attente de téléversement'
  },
  uploading: {
    name: 'fa-hourglass-half',
    fill: 'var(--green-archipel-sun-391-moon-716)',
    title: 'En cours de téléversement...'
  },
  failed: {
    name: 'ri-close-circle-line',
    fill: 'var(--error-425-625)',
    title: 'Échec du téléversement'
  },
  uploaded: {
    name: 'ri-checkbox-circle-line',
    fill: 'var(--success-425-625)',
    title: 'Téléversé'
  },
} as const

export const getIconPropsFromFileState = (state: keyof typeof states) => {
  return states[state]
}
