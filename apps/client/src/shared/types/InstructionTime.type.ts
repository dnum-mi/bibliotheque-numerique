export enum keyInstructionTime {
  TEMPS_RESTANT = 'remainingTime',
  ETAT_DELAI = 'delayStatus',
}

export type TypeInstructionTime = {
  [keyInstructionTime.TEMPS_RESTANT]: number,
  [keyInstructionTime.ETAT_DELAI]: string,
}

export type TypeInstructionTimes = {
  [idDossier: number]: TypeInstructionTime
}

export enum LabelInstructionTime {
  TEMPS_RESTANT = 'Temps restant',
  ETAT_DELAI = 'État délai',
}

export const mappingLabelInstructionToKey = {
  [LabelInstructionTime.TEMPS_RESTANT]: keyInstructionTime.TEMPS_RESTANT,
  [LabelInstructionTime.ETAT_DELAI]: keyInstructionTime.ETAT_DELAI,
}

export enum EInstructionTimeState {
  FIRST_REQUEST = 'FIRST_REQUEST',
  FIRST_RECEIPT = 'FIRST_RECEIPT',
  IN_PROGRESS = 'IN_PROGRESS',
  OUT_OF_DATE = 'OUT_OF_DATE',
  IN_EXTENSION = 'IN_EXTENSION',
  SECOND_REQUEST = 'SECOND_REQUEST',
  SECOND_RECEIPT = 'SECOND_RECEIPT',
  INTENT_OPPO = 'INTENT_OPPO',
  IN_ERROR = 'ERROR',
}
