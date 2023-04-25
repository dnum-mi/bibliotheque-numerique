export enum keyInstructionTime {
  TEMPS_RESTANT = 'tempsRestant',
  ETAT_DELAI = 'etatDelai',
}

export type TypeInstructionTime = {
  [keyInstructionTime.TEMPS_RESTANT]: number,
  [keyInstructionTime.ETAT_DELAI]: string,
}

export type TypeInstructionTimes = {
  [idDossier: number]: TypeInstructionTime
}
