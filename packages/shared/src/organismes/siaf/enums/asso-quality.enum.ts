import { createEnum } from 'factories'

export const assoQualityArray = [
  'Cultuelle',
  'Reconnue d\'utilité publique',
  'Grande capacité juridique',
  'Mixte',
] as const

export type AssoQualityKey = (typeof assoQualityArray)[number]
export const eAssoQuality = createEnum(assoQualityArray)
