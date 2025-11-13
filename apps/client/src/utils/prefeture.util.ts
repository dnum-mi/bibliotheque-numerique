import { listOfVerbosePrefecture, PrefectureDictionary } from '@biblio-num/shared'
import type { PrefectureKey } from '@biblio-num/shared'

export const getPrefecture = (prefecture: PrefectureKey | string): string => {
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
