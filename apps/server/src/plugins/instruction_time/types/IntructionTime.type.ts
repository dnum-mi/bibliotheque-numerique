export const EInstructionTimeState = {
  FIRST_REQUEST: "FIRST_REQUEST",
  IN_PROGRESS: "IN_PROGRESS",
  OUT_OF_DATE: "OUT_OF_DATE",
  IN_EXTENSION: "IN_EXTENSION",
  SECOND_REQUEST: "SECOND_REQUEST",
  SECOND_RECEIPT: "SECOND_RECEIPT",
  INTENT_OPPO: "INTENT_OPPO",
} as const;

export type EInstructionTimeStateKey =
  (typeof EInstructionTimeState)[keyof typeof EInstructionTimeState];
