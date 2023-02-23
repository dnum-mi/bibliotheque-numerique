import { Injectable, Logger } from "@nestjs/common";
import { DsApiClient } from "@lab-mi/ds-api-client";
import { Demarche as TDemarche } from "@lab-mi/ds-api-client/dist/@types/types";

import { DemarcheDS } from "../entities";
import { LoggerService } from "../logger/logger.service";
import { DemarchesService } from "../demarches/demarches.service";
import { DataSource } from "typeorm";

@Injectable()
export class DemarchesDSService {
  private readonly logger = new Logger(
    DemarchesDSService.name,
  ) as unknown as LoggerService;

  constructor(
    private demarchesService: DemarchesService,
    private dataSource: DataSource,
  ) {}

  async demarchesByAPI(demarcheNumbers?: number[]) {
    const dsApiClient = new DsApiClient(
      process.env.DS_API_URL,
      process.env.DS_API_TOKEN,
    );

    return await Promise.all(
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
  }

  async upsertDemarchesDSAndDemarches(demarcheNumbers?: number[]) {
    const demarches = await this.demarchesByAPI(demarcheNumbers);
    try {
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        const toUpsert = demarches
          .filter((demarche: TDemarche) => demarche)
          .map<Partial<DemarcheDS>>((demarche) => ({
            id: demarche.number,
            dataJson: demarche,
            dsUpdateAt: demarche.dateDerniereModification
              ? new Date(demarche.dateDerniereModification)
              : new Date(),
          }));

        const upsertResultDemarchesDS = await DemarcheDS.upsertDemarcheDS(
          toUpsert,
          transactionalEntityManager,
        );

        const insertResultDemarches =
          await this.demarchesService.upsertDemarches(
            upsertResultDemarchesDS.raw,
            transactionalEntityManager,
          );

        return {
          demarchesDS: upsertResultDemarchesDS,
          demarches: insertResultDemarches,
        };
      });
    } catch (error) {
      this.logger.error({
        short_message: "Échec de la mise à jour des demarches_ds",
        full_message: error.toString(),
      });
      throw new Error("Unable to update demarches_ds");
    }
  }

  async allDemarchesIds() {
    const allDemarcheEntity = await DemarcheDS.find();
    return allDemarcheEntity.map((id) => id.id);
  }
}
