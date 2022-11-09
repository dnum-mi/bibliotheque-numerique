import { Injectable, Logger } from "@nestjs/common";
import { DsApiClient } from "@lab-mi/ds-api-client";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertResult, Repository } from "typeorm";

import { DemarcheDS } from "../entities";

@Injectable()
export class DemarchesDSService {
  private readonly logger = new Logger(DemarchesDSService.name);

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
        const response = await dsApiClient.demarche(id);
        return response?.demarche;
      }),
    );

    try {
      const toUpsert = demarches.map((demarche) => ({
        id: demarche.number,
        dataJson: demarche,
        dsUpdateAt: demarche.dateDerniereModification
          ? new Date(demarche.dateDerniereModification)
          : new Date(),
      }));

      return this.demarcheDSRepository
        .createQueryBuilder()
        .insert()
        .into(DemarcheDS)
        .values(toUpsert)
        .orUpdate(["dataJson", "updateAt", "dsUpdateAt"], "pk_demarche_ds_id", {
          skipUpdateIfNoValuesChanged: true,
        })
        .returning(["id", "dataJson"])
        .execute();
    } catch (e) {
      this.logger.error(e);
    }
  }
}
