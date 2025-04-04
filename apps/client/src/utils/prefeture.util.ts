import { PrefectureDictionary } from '@biblio-num/shared'
import type { PrefectureKey } from '@biblio-num/shared'

export const getPrefecture = (prefecture: PrefectureKey | string): string => {
  if (!prefecture) {
    return ''
  }
  const prefectureValue = PrefectureDictionary[prefecture as PrefectureKey]
  if (prefectureValue) {
    return prefectureValue
  }
  return prefecture
}
