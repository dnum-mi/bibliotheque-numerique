import { createEnum } from "factories"

export const foundationType = [
  'unknown',
  'FDD',
  'FE',
  'FRUP',
  'SCI',
  'PART',
  'UNI'
] as const

export type FoundationTypeKey = (typeof foundationType)[number]
export const eFoundationType = createEnum(foundationType)
