import { createEnum } from 'factories'

export const typeFileArray = [
  "Acte d'autorisation",
  'Acte notarié',
  'Comptes',
  "Courrier adressé par l'administration",
  'Décision de retrait',
  'Jugement',
  'Mise en demeure',
  'Procès verbal',
  "Rapport d'activité",
  'Règlement intérieur',
  'Statuts',
  'Suspension',
] as const

export type TypeFileKey = (typeof typeFileArray)[number]
export const eTypeFile = createEnum(typeFileArray)
