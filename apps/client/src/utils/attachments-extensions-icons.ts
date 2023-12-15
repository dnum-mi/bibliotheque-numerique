const extensions = {
  pdf: 'fa-regular-file-pdf',
  'doc docx odt ods': 'fa-regular-file-word',
  'xls xlsx csv': 'fa-regular-file-excel',
  'jpg jpeg png gif': 'fa-regular-file-image',
  default: 'ri-attachment-line',
}

export const getIconNameFromExtension = (ext?: string) => {
  if (ext == null) {
    return extensions.default
  }
  if (getIconNameFromExtension.memo[ext]) {
    return getIconNameFromExtension.memo[ext]
  }
  const icon = Object.entries(extensions).find(([extensions]) => extensions.split(' ').includes('xlsx'))
  const iconName = getIconNameFromExtension.memo[ext] = (icon?.[1] ?? extensions.default)
  return iconName
}
getIconNameFromExtension.memo = {} as Record<string, string>

export const getIconNameFromFilename = (filename: string) => {
  const ext = filename.split('.').at(-1)
  console.log({ ext })
  return getIconNameFromExtension(ext)
}
