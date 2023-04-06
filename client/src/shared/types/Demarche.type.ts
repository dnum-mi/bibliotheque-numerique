export type TypeDemarcheStateMapping = {
  brouillon: string,
  publiee: string,
  close: string,
  depubliee: string,
}

export type KeyDemarcheStateMapping = keyof TypeDemarcheStateMapping

export enum TypeDeChampDS {
  TEXT = 'text',
  REPETITION = 'repetition',
  PIECE_JUSTIFICATIVE = 'piece_justificative',
  TITRE_IDENTITE = 'titre_identite'
}

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

export const typeForHeader = {
  [ChampValueTypesKeys.TEXT]: 'text',
  [ChampValueTypesKeys.NUMBER]: 'number',
  // [ChampValueTypesKeys.BOOLEAN]: 'boolean',
  [ChampValueTypesKeys.DATE]: 'date',
  [ChampValueTypesKeys.PJ]: 'file',
}

export const valueBytypeValue = {
  // [ChampValueTypesKeys.TEXT]: 'stringValue',
  // [ChampValueTypesKeys.NUMBER]: 'value',
  // [ChampValueTypesKeys.BOOLEAN]: 'value',
  [ChampValueTypesKeys.DATE]: 'date',
  [ChampValueTypesKeys.PJ]: 'file',
}

export const keytoTypeData = {
  [ChampType.CHAMP]: 'champs',
  [ChampType.ANNOTATION]: 'annotations',
}
