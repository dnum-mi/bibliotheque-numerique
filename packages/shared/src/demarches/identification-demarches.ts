import { createEnum } from '../factories'

// FE = Déclaration de FE
// DDC = Dépôt de compte
// MAARCH = SCV - MAARCH

export const identificationDemarcheKeys = ['FE', 'DDC', 'MAARCH'] as const
export type IdentificationDemarcheKey =
  (typeof identificationDemarcheKeys)[number]
export const eIdentificationDemarche = createEnum(identificationDemarcheKeys)
