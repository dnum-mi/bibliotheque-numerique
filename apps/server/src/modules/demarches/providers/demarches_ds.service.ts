import { Injectable } from "@nestjs/common";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { DemarchesService } from "./demarches.service";
import { DataSource, EntityManager, Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import {
  Demarche as GqlDemarche,
  DsApiClient,
  DsApiError,
} from "@dnum-mi/ds-api-client";
import { DemarcheDS } from "../entities/demarche_ds.entity";
import { BaseEntityService } from "../../../shared/base-entity/base-entity.service";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class DemarchesDSService extends BaseEntityService<DemarcheDS> {
  private dsApiClient: DsApiClient;

  constructor(
    private demarchesService: DemarchesService,
    private dataSource: DataSource,
    private config: ConfigService,
    protected logger: LoggerService,
    @InjectRepository(DemarcheDS)
    protected readonly repo: Repository<DemarcheDS>,
  ) {
    super(repo, logger);
    this.dsApiClient = new DsApiClient(
      this.config.get("ds.apiUrl"),
      this.config.get("ds.apiToken"),
    );
    this.logger.setContext(this.constructor.name);
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private async _upsertDemarcheDS(
    toUpsert: Partial<DemarcheDS> | Partial<DemarcheDS>[],
    transactionalEntityManager: EntityManager,
  ) {
    this.logger.verbose("_upsertDemarcheDS");
    console.log(toUpsert);
    return transactionalEntityManager
      .createQueryBuilder()
      .insert()
      .into(DemarcheDS)
      .values(toUpsert)
      .orUpdate(["dataJson", "updateAt", "dsUpdateAt"], "PK_DEMARCHE_DS_ID", {
        skipUpdateIfNoValuesChanged: true,
      })
      .returning(["id", "dataJson"])
      .execute();
  }

  async upsertAllDemarche(): Promise<number[]> {
    this.logger.verbose("upsertAllDemarche");
    this.logger.log("Upserting all demarches");
    const demarcheIds: number[] = await this.allDemarchesIds();
    this.logger.log("Id found for demarche: " + demarcheIds.join(", "));
    await this.upsertDemarchesDSAndDemarches(demarcheIds);
    return demarcheIds;
  }

  async demarchesByAPI(
    demarcheNumbers?: number[],
  ): Promise<Partial<GqlDemarche>[]> {
    this.logger.verbose("demarchesByAPI");
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
    this.logger.verbose("upsertDemarchesDSAndDemarches");
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

      const upsertResultDemarchesDS = await this._upsertDemarcheDS(
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
    this.logger.verbose("allDemarchesIds");
    const allDemarcheEntity = await this.repo.find({ select: ["id"] });
    return allDemarcheEntity.map((demarche) => demarche.id) || [];
  }
}
