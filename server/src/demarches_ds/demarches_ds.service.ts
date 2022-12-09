import { Injectable, Logger } from "@nestjs/common";
import { DsApiClient } from "@lab-mi/ds-api-client";
import { InsertResult } from "typeorm";
import { Demarche as TDemarche } from "@lab-mi/ds-api-client/dist/@types/types";

import { DemarcheDS } from "../entities";
import { LoggerService } from "../logger/logger.service";
import { DemarchesService } from "../demarches/demarches.service";

@Injectable()
export class DemarchesDSService {
  private readonly logger = new Logger(
    DemarchesDSService.name,
  ) as unknown as LoggerService;

  constructor(private demarchesService: DemarchesService) {}

  async updateDemarchesDS(demarcheNumbers?: number[]) {
    const dsApiClient = new DsApiClient(
      process.env.DS_API_URL,
      process.env.DS_API_TOKEN,
    );

    const demarches = await Promise.all(
      demarcheNumbers.map(async (id) => {
        try {
          const response = await dsApiClient.demarche(id);
          return response?.demarche;
        } catch (error) {
          this.logger.error({
            short_message: `Échec de la récupération de la démarche n°${id}`,
            full_message: error.toString(),
          });
          return undefined;
        }
      }),
    );

    const toUpsert = demarches
      .filter((demarche: TDemarche) => demarche)
      .map<Partial<DemarcheDS>>((demarche) => ({
        id: demarche.number,
        dataJson: demarche,
        dsUpdateAt: demarche.dateDerniereModification
          ? new Date(demarche.dateDerniereModification)
          : new Date(),
      }));
    try {
      const insertResultDemarchesDS = await DemarcheDS.upsertDemarcheDS(
        toUpsert,
      );
      const insertResultDemarches = await this.demarchesService.updateDemarches(
        insertResultDemarchesDS.raw,
      );
      return {
        demarchesDS: insertResultDemarchesDS,
        demarches: insertResultDemarches,
      };
    } catch (error) {
      this.logger.error({
        short_message: "Échec de la mise à jour des demarches_ds",
        full_message: error.toString(),
      });
      throw new Error("Unable to update demarches_ds");
    }
  }
}
