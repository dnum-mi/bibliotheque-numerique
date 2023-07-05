import { registerAs } from "@nestjs/config";

export default registerAs("ds", () => ({
  host: process.env.DS_API_HOST,
  api: process.env.DS_API_URL,
  token: process.env.DS_API_TOKEN,
  demarcheFDDId: process.env.DS_DEMARCHE_FDD_ID,
  demarcheFEId: process.env.DS_DEMARCHE_FE_ID,
  demarcheDNRId: process.env.DS_DEMARCHE_DNR_ID,
  annotationFDDId: process.env.DS_FDD_RNF_ANNOTATION_ID,
  annotationFEId: process.env.DS_FE_RNF_ANNOTATION_ID,
  annotationDNRId: process.env.DS_DNR_RNF_ANNOTATION_ID,
}));
