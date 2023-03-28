export type TypeDemarcheStateMapping = {
  brouillon: string,
  publiee: string,
  close: string,
  depubliee: string,
}

export type KeyDemarcheStateMapping = keyof TypeDemarcheStateMapping

export enum ChampType {
  CHAMP = 'champ',
  ANNOTATION = 'annotation'
}

export enum ChampValueTypesKeys {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  PJ = 'pj'
}

export const ChampValueTypes = {
  [ChampValueTypesKeys.TEXT]: 'Texte',
  [ChampValueTypesKeys.NUMBER]: 'Numéro',
  [ChampValueTypesKeys.DATE]: 'Date',
  [ChampValueTypesKeys.PJ]: 'Pièce Jointe',
}
