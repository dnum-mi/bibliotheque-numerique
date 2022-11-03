import { Injectable, Logger } from "@nestjs/common";
import { DsApiClient } from "@lab-mi/ds-api-client";
import { DossierDS } from "../entities";

@Injectable()
export class DossiersDSService {
  private readonly logger = new Logger(DossiersDSService.name);
  private dsApiClient = new DsApiClient(
    process.env.DS_API_URL,
    process.env.DS_API_TOKEN,
  );

  async upsertDossierDS(dossierNumber: number) {
    try {
      const response = await this.dsApiClient.dossier(dossierNumber);
      const dossier = response?.dossier;
      await DossierDS.tryUpsertDossierDS(dossier);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async upsertDemarcheDossiersDS(demarcheNumber: number) {
    try {
      const response = await this.dsApiClient.demarcheDossiers(demarcheNumber);
      const dossiers = response?.demarche?.dossiers?.nodes;
      if (dossiers) {
        await Promise.all(
          dossiers.map(async (dossier) => {
            await DossierDS.tryUpsertDossierDS(dossier);
          }),
        );
      }
    } catch (e) {
      this.logger.error(e);
    }
  }
}
