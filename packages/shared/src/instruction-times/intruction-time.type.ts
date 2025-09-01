import { createEnum } from "../factories";

export const instructionTimeState = [
'FIRST_REQUEST',
'FIRST_RECEIPT',
'IN_PROGRESS',
'OUT_OF_DATE',
'IN_EXTENSION',
'SECOND_REQUEST',
'SECOND_RECEIPT',
'INTENT_OPPO',
'IN_ERROR',
] as const

export type InstructionTimeStateKey = (typeof instructionTimeState)[number]
export const eInstructionTimeState = createEnum(instructionTimeState)

export const EInstructionTimeState = {
  DEFAULT: '',
  FIRST_REQUEST: 'FIRST_REQUEST',
  FIRST_RECEIPT: 'FIRST_RECEIPT',
  IN_PROGRESS: 'IN_PROGRESS',
  OUT_OF_DATE: 'OUT_OF_DATE',
  IN_EXTENSION: 'IN_EXTENSION',
  SECOND_REQUEST: 'SECOND_REQUEST',
  SECOND_RECEIPT: 'SECOND_RECEIPT',
  INTENT_OPPO: 'INTENT_OPPO',
  IN_ERROR: 'ERROR',
} as const

export type EInstructionTimeStateKey = (typeof EInstructionTimeState)[keyof typeof EInstructionTimeState];
