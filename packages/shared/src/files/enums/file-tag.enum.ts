const fileTags = [
  'status',
  'depot-de-compte',
]

export type FileTagKey = (typeof fileTags)[number]

export const eFileTag = Object.fromEntries(
  fileTags.map(ft => [ft, ft]),
) as Record<FileTagKey, FileTagKey>
