import { createEnum } from "../factories";
import { EInstructionTimeState } from "./intruction-time.type";

export const instructionTimeValues = [
'1ère demande',
'1ère demande',
'Intention opposition',
'Erreur',
'Prorogation',
'Instruction',
'Délai expiré',
'2ème demande',
'2ème demande',
] as const

export type InstructionTimeValueKey = (typeof instructionTimeValues)[number]
export const eInstructionTimeValue = createEnum(instructionTimeValues)

export const instructionTimeValueDictionary = {
  [EInstructionTimeState.FIRST_REQUEST]: eInstructionTimeValue['1ère demande'],
  [EInstructionTimeState.FIRST_RECEIPT]: eInstructionTimeValue['1ère demande'],
  [EInstructionTimeState.INTENT_OPPO]: eInstructionTimeValue['Intention opposition'],
  [EInstructionTimeState.IN_ERROR]: eInstructionTimeValue['Erreur'],
  [EInstructionTimeState.IN_EXTENSION]: eInstructionTimeValue['Prorogation'],
  [EInstructionTimeState.IN_PROGRESS]: eInstructionTimeValue['Instruction'],
  [EInstructionTimeState.OUT_OF_DATE]: eInstructionTimeValue['Délai expiré'],
  [EInstructionTimeState.SECOND_RECEIPT]: eInstructionTimeValue['2ème demande'],
  [EInstructionTimeState.SECOND_REQUEST]: eInstructionTimeValue['2ème demande'],
} as const
