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
  ANNOTATION = 'annotation',
  INSTRUCTION_TIME='instructionTime'
}

export enum ChampValueTypesKeys {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  PJ = 'pj',
  ON_ONE_ROW = 'onOneRow',
  ON_ONE_OBJECT = 'onOneObject'
}

export const ChampValueBaseTypes = {
  [ChampValueTypesKeys.TEXT]: 'Texte',
  [ChampValueTypesKeys.NUMBER]: 'Nombre',
}

export const ChampValueTypes = {
  ...ChampValueBaseTypes,
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
  [ChampValueTypesKeys.NUMBER]: 'integerNumber',
  // [ChampValueTypesKeys.BOOLEAN]: 'value',
  [ChampValueTypesKeys.DATE]: 'date',
  [ChampValueTypesKeys.PJ]: 'file',
}

export const keytoTypeData = {
  [ChampType.CHAMP]: 'champs',
  [ChampType.ANNOTATION]: 'annotations',
}

export enum typeTable {
  DEFAULT = 'default',
  GROUP = 'group',
  MULTILINE = 'multiline'
}
