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

export enum ChampValueTypes {
  text = 'Texte',
  number = 'Numéro',
  date = 'Date',
  pj = 'Pièce Jointe'
}
