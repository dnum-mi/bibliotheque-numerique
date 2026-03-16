import { createEnum } from "factories"

export const foundationTypeWithoutUnknown = [
  'FDD',
  'FE',
  'FRUP',
  'SCI',
  'PART',
  'UNI'
]
export const foundationType = [
  'unknown',
  ...foundationTypeWithoutUnknown
] as const

export type FoundationTypeKey = (typeof foundationType)[number]
export const eFoundationType = createEnum(foundationType)
