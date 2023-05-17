import { Injectable, Logger } from "@nestjs/common";

import { DemarcheDS } from "../entities";
import { LoggerService } from "../logger/logger.service";
import { DemarchesService } from "../demarches/demarches.service";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import {
  DsApiClient,
  DsApiError,
  Demarche as GqlDemarche,
} from "@dnum-mi/ds-api-client";

@Injectable()
export class DemarchesDSService {
  // TODO: logger should be injected with nestjs dependency injection
  private readonly logger = new Logger(
    DemarchesDSService.name,
  ) as unknown as LoggerService;

  private dsApiClient: DsApiClient;

  constructor(
    private demarchesService: DemarchesService,
    private dataSource: DataSource,
    private config: ConfigService,
  ) {
    this.dsApiClient = new DsApiClient(
      this.config.get("ds.apiUrl"),
      this.config.get("ds.apiToken"),
    );
  }

  // This method is called by the cron job
  async upsertAllDemarche(): Promise<number[]> {
    this.logger.log("Upserting all demarches");
    const demarcheIds: number[] = await this.allDemarchesIds();
    this.logger.log("Id found for demarche: " + demarcheIds.join(", "));
    await this.upsertDemarchesDSAndDemarches(demarcheIds);
    return demarcheIds;
  }

  async demarchesByAPI(
    demarcheNumbers?: number[],
  ): Promise<Partial<GqlDemarche>[]> {
    const result = [];
    for (const id of demarcheNumbers) {
      try {
        const response = await this.dsApiClient.demarche(id);
        result.push(response.demarche);
      } catch (e: unknown) {
        const gqlError = e as DsApiError;
        this.logger.error(
          `Échec de la récupération de la démarche n°${id}\n${gqlError.message}`,
        );
        // TODO: log more information available in gqlError if needed (when reforge of logger)
      }
    }
    if (!result.length) {
      this.logger.warn("No demarches found");
    }
    return result;
  }

  async upsertDemarchesDSAndDemarches(demarcheNumbers?: number[]) {
    const demarches = await this.demarchesByAPI(demarcheNumbers);
    if (!demarches.length) {
      return;
    }
    // TODO: inject transional Entity manager in corresponding service
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const toUpsert = demarches.map<Partial<DemarcheDS>>((demarche) => ({
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

      const insertResultDemarches = await this.demarchesService.upsertDemarches(
        upsertResultDemarchesDS.raw,
        transactionalEntityManager,
      );

      return {
        demarchesDS: upsertResultDemarchesDS,
        demarches: insertResultDemarches,
      };
    });
  }

  async allDemarchesIds(): Promise<number[]> {
    const allDemarcheEntity = await DemarcheDS.find({ select: ["id"] });
    return allDemarcheEntity.map((demarche) => demarche.id) || [];
  }
}
