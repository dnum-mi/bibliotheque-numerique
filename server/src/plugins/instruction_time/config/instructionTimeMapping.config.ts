const config = {
  instructionTimeMappingConfig: {
    DateRequest1: "Date de la première demande de pièces",
    DateReceipt1: "Date de réception des pièces de la première demande",
    BeginProrogationDate: "Date de début de prorogation",
    DurationExtension: "Durée de la prorogation",
    DateRequest2: "Date de deuxième demande de pièces complémentaires",
    DateReceipt2: "Date de réception des pièces de la deuxième demande",
  },
};

export type TInstructionTimeMappingConfig = typeof config;
export default () => config;
