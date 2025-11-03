import { createEnum } from 'factories'

export const rnaTypeRecepisseArray = [
  'Création',
  'Modification',
  'Dissolution',
] as const

export type RnaTypeRecepisseKey = (typeof rnaTypeRecepisseArray)[number]
export const eRnaTypeRecepisse = createEnum(rnaTypeRecepisseArray)
