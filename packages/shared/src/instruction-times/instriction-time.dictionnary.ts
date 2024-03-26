import { EInstructionTimeState } from "./intruction-time.type";

export const instructionTimeValueDictionary = {
  [EInstructionTimeState.FIRST_REQUEST]: '1ère demande',
  [EInstructionTimeState.FIRST_RECEIPT]: '1ère demande',
  [EInstructionTimeState.INTENT_OPPO]: 'Intention opposition',
  [EInstructionTimeState.IN_ERROR]: 'Erreur',
  [EInstructionTimeState.IN_EXTENSION]: 'Prorogation',
  [EInstructionTimeState.IN_PROGRESS]: 'Instruction',
  [EInstructionTimeState.OUT_OF_DATE]: 'Délai expiré',
  [EInstructionTimeState.SECOND_RECEIPT]: '2ème demande',
  [EInstructionTimeState.SECOND_REQUEST]: '2ème demande',
} as const
