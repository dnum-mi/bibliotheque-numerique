import { listOfVerbosePrefecture, PrefectureDictionary } from '@biblio-num/shared'
import type { PrefectureKey } from '@biblio-num/shared'

export const getPrefecture = (prefecture: PrefectureKey | string | null | undefined): string => {
  if (!prefecture) {
    return ''
  }
  const prefectureValue = PrefectureDictionary[prefecture as PrefectureKey]
  if (prefectureValue) {
    return prefectureValue
  }

  const found = listOfVerbosePrefecture.find((pref) => pref.startsWith(prefecture as string))
  if (found) {
    return found
  }
  return prefecture
}

export const getDepartmentCodeFromCodeInsee = (codeinsee: string | null | undefined): string => {
  if (!codeinsee) {
    return ''
  }
  if (codeinsee.startsWith('97') || codeinsee.startsWith('98')) {
    return codeinsee.substring(0, 3)
  }
  return codeinsee.substring(0, 2)
}
