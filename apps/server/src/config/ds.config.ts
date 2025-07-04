import { registerAs } from '@nestjs/config'

export default registerAs('ds', () => ({
  dossier: {
    champs: {
      pjTypeName: ['PieceJustificativeChamp', 'TitreIdentiteChamp'],
      repetitionTypeName: ['RepetitionChamp'],
    },
  },
  procedure: {
    pjTypeName: {
      deliberation: 'deliberation',
    },
  },
  apiUrl: process.env.DS_API_URL || 'https://demarches-simplifiees.fr/api/v2/graphql',
  apiToken: process.env.DS_API_TOKEN || 'no-token-set',
  health: process.env.DS_API_HEALTH || false,
}))
