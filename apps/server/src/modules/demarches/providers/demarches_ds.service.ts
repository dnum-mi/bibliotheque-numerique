import { Injectable } from "@nestjs/common";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { DemarchesService } from "./demarches.service";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import {
  Demarche as GqlDemarche,
  DsApiClient,
  DsApiError,
} from "@dnum-mi/ds-api-client";
import { DemarcheDS } from "../entities/demarche_ds.entity";

@Injectable()
export class DemarchesDSService {
  private dsApiClient: DsApiClient;

  constructor(
    private demarchesService: DemarchesService,
    private dataSource: DataSource,
    private config: ConfigService,
    private logger: LoggerService,
  ) {
    this.dsApiClient = new DsApiClient(
      this.config.get("ds.apiUrl"),
      this.config.get("ds.apiToken"),
    );
    this.logger.setContext(this.constructor.name);
  }

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

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
