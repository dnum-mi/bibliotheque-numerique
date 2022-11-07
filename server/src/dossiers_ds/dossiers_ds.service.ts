import { Injectable, Logger } from "@nestjs/common";
import { DsApiClient } from "@lab-mi/ds-api-client";
import { DemarcheEntity, DossierDS } from "../entities";

@Injectable()
export class DossiersDSService {
  private readonly logger = new Logger(DossiersDSService.name);
  private dsApiClient = new DsApiClient(
    process.env.DS_API_URL,
    process.env.DS_API_TOKEN,
  );

  async upsertDossierDS(dossierNumber: number, demarcheNumber: number) {
    try {
      const response = await this.dsApiClient.dossier(dossierNumber);
      const dossier = response?.dossier;
      const demarcheEntity = await DemarcheEntity.findOneBy({
        demarcheDS: { id: demarcheNumber },
      });
      await DossierDS.tryUpsertDossierDS(dossier, demarcheEntity);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async upsertDemarcheDossiersDS(demarcheNumber: number) {
    try {
      const response = await this.dsApiClient.demarcheDossiers(demarcheNumber);
      const dossiers = response?.demarche?.dossiers?.nodes;
      const demarcheEntity = await DemarcheEntity.findOneBy({
        demarcheDS: { id: demarcheNumber },
      });
      if (dossiers) {
        await Promise.all(
          dossiers.map(async (dossier) => {
            await DossierDS.tryUpsertDossierDS(dossier, demarcheEntity);
          }),
        );
      }
    } catch (e) {
      this.logger.error(e);
    }
  }
}
