import { createEnum } from "factories"

export const dossierSourceArray = [
  'ds',
  'rna',
] as const

export type DossierSourceKey = typeof dossierSourceArray[keyof typeof dossierSourceArray]
export const eDossierSource = createEnum(dossierSourceArray)
