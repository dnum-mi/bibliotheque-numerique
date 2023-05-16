// TODO: those are not configs
const config = {
  ds: {
    dossier: {
      champs: {
        pjTypeName: ["PieceJustificativeChamp", "TitreIdentiteChamp"],
        repetitionTypeName: ["RepetitionChamp"],
      },
    },
    procedure: {
      pjTypeName: {
        deliberation: "deliberation",
      },
    },
  },
};

export default () => config;
