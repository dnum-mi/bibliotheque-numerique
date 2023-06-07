import { registerAs } from "@nestjs/config";

export default registerAs("ds", () => ({
  api: process.env.DS_API_URL,
  token: process.env.DS_API_TOKEN,
  demarcheDotationId: process.env.DS_DEMARCHE_DOTATION_ID,
  demarcheEntrepriseId: process.env.DS_DEMARCHE_ENTREPRISE_ID,
}));
