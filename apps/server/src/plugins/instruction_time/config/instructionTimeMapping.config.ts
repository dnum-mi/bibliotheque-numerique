export const keyInstructionTime = {
  DATE_REQUEST1: "DateRequest1",
  DATE_RECEIPT1: "DateReceipt1",
  BEGIN_PROROGATION_DATE: "BeginProrogationDate",
  DURATION_EXTENSION: "DurationExtension",
  DATE_REQUEST2: "DateRequest2",
  DATE_RECEIPT2: "DateReceipt2",
  DATE_INTENT_OPPOSITION: "DateIntentOpposition",
} as const;

const config = {
  instructionTimeMappingConfig: {
    [keyInstructionTime.DATE_REQUEST1]: "Date de la première demande de pièces",
    [keyInstructionTime.DATE_RECEIPT1]:
      "Date de réception des pièces de la première demande",
    [keyInstructionTime.BEGIN_PROROGATION_DATE]: "Date de début de prorogation",
    [keyInstructionTime.DURATION_EXTENSION]: "Durée de la prorogation",
    [keyInstructionTime.DATE_REQUEST2]:
      "Date de deuxième demande de pièces complémentaires",
    [keyInstructionTime.DATE_RECEIPT2]:
      "Date de réception des pièces de la deuxième demande",
    [keyInstructionTime.DATE_INTENT_OPPOSITION]:
      "Date de l'intention d'opposition aux financements",
  },
  NB_DAYS_AFTER_INSTRUCTION: 60,
  NB_DAYS_AFTER_EXTENSION: 120,
  NB_DAYS_AFTER_INTENT_OPPOSITION: 30,
};

export type TInstructionTimeMappingConfig = typeof config;
export default () => config;
