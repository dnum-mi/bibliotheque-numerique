import { registerAs } from "@nestjs/config";

// all config concerning `Démarches Simplifiées`
export default registerAs("ds", () => ({
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
  apiUrl:
    process.env.DS_API_URL || "https://195.154.196.196:3000/api/v2/graphql",
  apiToken: process.env.DS_API_TOKEN || "no-token-set",
}));
