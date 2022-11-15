import { Injectable, Logger } from "@nestjs/common";
import { DsApiClient } from "@lab-mi/ds-api-client";
import { Demarche, DossierDS } from "../entities";
import { LoggerService } from "../logger/logger.service";

@Injectable()
export class DossiersDSService {
  private readonly logger = new Logger(
    DossiersDSService.name,
  ) as unknown as LoggerService;

  private dsApiClient = new DsApiClient(
    process.env.DS_API_URL,
    process.env.DS_API_TOKEN,
  );

  async upsertDossierDS(dossierNumber: number, demarcheNumber: number) {
    try {
      const response = await this.dsApiClient.dossier(dossierNumber);
      const dossier = response?.dossier;
      const demarcheEntity = await Demarche.findOneBy({
        demarcheDS: { id: demarcheNumber },
      });
      await DossierDS.tryUpsertDossierDS(dossier, demarcheEntity);
    } catch (error) {
      this.logger.error({
        short_message: "Échec de la mise à jour des dossiers_ds",
        full_message: error.toString(),
      });
      throw new Error("Unable to update dossiers_ds");
    }
  }

  async upsertDemarcheDossiersDS(demarcheNumber: number) {
    try {
      const response = await this.dsApiClient.demarcheDossiers(demarcheNumber);
      const dossiers = response?.demarche?.dossiers?.nodes;
      const demarcheEntity = await Demarche.findOneBy({
        demarcheDS: { id: demarcheNumber },
      });
      if (dossiers && dossiers.length > 0) {
        return await Promise.all(
          dossiers.map(async (dossier) => {
            await DossierDS.tryUpsertDossierDS(dossier, demarcheEntity);
          }),
        );
      } else {
        this.logger.warn({
          short_message: "No dossier to upsert",
          full_message: `No dossier to upsert for demarche number: ${demarcheNumber}`,
        });
      }
    } catch (error) {
      this.logger.error({
        short_message: "Échec de la mise à jour des dossiers_ds",
        full_message: error.toString(),
      });
      throw new Error("Unable to update dossiers_ds");
    }
  }
}
