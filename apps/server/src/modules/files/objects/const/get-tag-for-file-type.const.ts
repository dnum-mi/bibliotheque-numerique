import {
  FileTagKey,
  TypeFileKey,
  dFileTabDictionary,
  eFileTag,
} from '@biblio-num/shared'

const typeToTagMap = new Map<TypeFileKey, FileTagKey>()

for (const tag in dFileTabDictionary) {
  typeToTagMap.set(
    dFileTabDictionary[tag as FileTagKey] as TypeFileKey,
    tag as FileTagKey,
  )
}

export const getTagForType = (
  typeFile: TypeFileKey | undefined | null,
): FileTagKey => {
  if (!typeFile) {
    return eFileTag.other
  }
  return typeToTagMap.get(typeFile) || eFileTag.other
}
