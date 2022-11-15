import { Injectable, Logger } from "@nestjs/common";
import { DsApiClient } from "@lab-mi/ds-api-client";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertResult, Repository } from "typeorm";
import { Demarche as TDemarche } from "@lab-mi/ds-api-client/dist/@types/types";

import { DemarcheDS } from "../entities";
import { LoggerService } from "../logger/logger.service";

@Injectable()
export class DemarchesDSService {
  private readonly logger = new Logger(
    DemarchesDSService.name,
  ) as unknown as LoggerService;

  constructor(
    @InjectRepository(DemarcheDS)
    private demarcheDSRepository: Repository<DemarcheDS>,
  ) {}

  async updateDemarchesDS(demarcheNumbers?: number[]): Promise<InsertResult> {
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
      .map((demarche) => ({
        id: demarche.number,
        dataJson: demarche,
        dsUpdateAt: demarche.dateDerniereModification
          ? new Date(demarche.dateDerniereModification)
          : new Date(),
      }));
    try {
      return await this.demarcheDSRepository
        .createQueryBuilder()
        .insert()
        .into(DemarcheDS)
        .values(toUpsert)
        .orUpdate(["dataJson", "updateAt", "dsUpdateAt"], "pk_demarche_ds_id", {
          skipUpdateIfNoValuesChanged: true,
        })
        .returning(["id", "dataJson"])
        .execute();
    } catch (error) {
      this.logger.error({
        short_message: "Échec de la mise à jour des demarches_ds",
        full_message: error.toString(),
      });
      throw new Error("Unable to update demarches_ds");
    }
  }
}
