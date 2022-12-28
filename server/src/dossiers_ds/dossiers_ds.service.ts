import { Injectable, Logger } from "@nestjs/common";
import { DsApiClient } from "@lab-mi/ds-api-client";
import { Dossier as TDossier } from "@lab-mi/ds-api-client/dist/@types/types";
import { DossierDS } from "../entities";
import { LoggerService } from "../logger/logger.service";
import { DossiersService } from "../dossiers/dossiers.service";
import { DataSource } from "typeorm";

@Injectable()
export class DossiersDSService {
  private readonly logger = new Logger(
    DossiersDSService.name,
  ) as unknown as LoggerService;

  private dsApiClient = new DsApiClient(
    process.env.DS_API_URL,
    process.env.DS_API_TOKEN,
  );

  constructor(
    private dossiersService: DossiersService,
    private dataSource: DataSource,
  ) {}

  async upsertDossierDS(dossierNumber: number, demarcheNumber: number) {
    try {
      const response = await this.dsApiClient.dossier(dossierNumber);
      const dossier = response?.dossier;

      return this.upsertDossierDSAndDossier(dossier, demarcheNumber);
    } catch (error) {
      this.logger.error({
        short_message: "No dossier to upsert",
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
        return await Promise.all(
          dossiers.map(async (dossier) => {
            await this.upsertDossierDSAndDossier(dossier, demarcheNumber);
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

  async upsertDossierDSAndDossier(
    dossier: Partial<TDossier>,
    demarcheNumber: number,
  ) {
    try {
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        const toUpsert = {
          id: dossier.number,
          dataJson: dossier,
          dsUpdateAt: dossier.dateDerniereModification,
        } as Partial<DossierDS>;
        const upsertResultDossiersDS = await DossierDS.upsertDossierDS(
          toUpsert,
          transactionalEntityManager,
        );

        const upsertResultDossiers = await this.dossiersService.upsertDossier(
          upsertResultDossiersDS.raw[0],
          demarcheNumber,
          transactionalEntityManager,
        );

        return {
          dossiersDS: upsertResultDossiersDS,
          dossiers: upsertResultDossiers,
        };
      });
    } catch (error) {
      this.logger.error({
        short_message: "Échec de la mise à jour des dossiers_ds",
        full_message: error.toString(),
      });
      throw new Error("Unable to update dossiers_ds");
    }
  }
}
