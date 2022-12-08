import { Injectable, Logger } from "@nestjs/common";
import { DsApiClient } from "@lab-mi/ds-api-client";
import { DossierDS } from "../entities";
import { LoggerService } from "../logger/logger.service";
import { DossiersService } from "../dossiers/dossiers.service";

@Injectable()
export class DossiersDSService {
  private readonly logger = new Logger(
    DossiersDSService.name,
  ) as unknown as LoggerService;

  private dsApiClient = new DsApiClient(
    process.env.DS_API_URL,
    process.env.DS_API_TOKEN,
  );

  constructor(private dossiersService: DossiersService) {}

  async upsertDossierDS(dossierNumber: number, demarcheNumber: number) {
    try {
      const response = await this.dsApiClient.dossier(dossierNumber);
      const dossier = response?.dossier;
      const toUpsert = {
        id: dossier.number,
        dataJson: dossier,
        dsUpdateAt: dossier.dateDerniereModification,
      } as Partial<DossierDS>;
      const insertResultDossiersDS = await DossierDS.upsertDossierDS(toUpsert);
      const insertResultDossiers = await this.dossiersService.updateDossiers(
        insertResultDossiersDS.raw,
        demarcheNumber,
      );
      return {
        dossiersDS: insertResultDossiersDS,
        dossiers: insertResultDossiers,
      };
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
      if (dossiers && dossiers.length > 0) {
        const toUpsert = dossiers.map<Partial<DossierDS>>((dossier) => ({
          id: dossier.number,
          dataJson: dossier,
          dsUpdateAt: dossier.dateDerniereModification,
        }));
        const insertResultDossiersDS = await DossierDS.upsertDossierDS(
          toUpsert,
        );
        const insertResultDossiers = await this.dossiersService.updateDossiers(
          insertResultDossiersDS.raw,
          demarcheNumber,
        );
        return {
          dossiersDS: insertResultDossiersDS,
          dossiers: insertResultDossiers,
        };
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
