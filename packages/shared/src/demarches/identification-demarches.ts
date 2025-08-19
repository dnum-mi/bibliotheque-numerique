import { createEnum } from '../factories'

// FE = Déclaration de FE
// DDC = Dépôt de compte

export const identificationDemarcheKeys = ['FE', 'DDC'] as const
export type IdentificationDemarcheKey =
  (typeof identificationDemarcheKeys)[number]
export const eIdentificationDemarche = createEnum(identificationDemarcheKeys)
