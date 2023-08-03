import { Injectable } from "@nestjs/common";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { EntityManager, InsertResult, Repository } from "typeorm";
import { DossierDS } from "../objects/entities/dossier_ds.entity";
import { Dossier } from "../objects/entities/dossier.entity";
import { DemarchesService } from "../../demarches/providers/demarches.service";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseEntityService } from "../../../shared/base-entity/base-entity.service";
import { FieldService } from "./field.service";

export type TUpsertDossier = Partial<
  Omit<Dossier, "dossierDS"> & { dossierDS: number }
>;

@Injectable()
export class DossiersService extends BaseEntityService<Dossier> {
  constructor(
    @InjectRepository(Dossier) protected readonly repo: Repository<Dossier>,
    protected readonly logger: LoggerService,
    private readonly demarcheService: DemarchesService,
    private readonly fieldService: FieldService,
  ) {
    super(repo, logger);
    this.logger.setContext(this.constructor.name);
  }

  private async _upsertDossier(
    toUpsert: TUpsertDossier | TUpsertDossier[],
    transactionalEntityManager: EntityManager,
  ): Promise<InsertResult> {
    this.logger.verbose("_upsertDossier");
    return transactionalEntityManager.upsert(Dossier, <never>toUpsert, {
      conflictPaths: ["dossierDS"],
      skipUpdateIfNoValuesChanged: true,
    });
  }

  async upsertDossier(
    dossierDS: DossierDS,
    demarcheNumber: number,
    transactionalEntityManager: EntityManager,
  ): Promise<InsertResult> {
    this.logger.verbose("upsertDossier");
    const demarcheEntity = await this.demarcheService.repository.findOneBy({
      demarcheDS: { id: demarcheNumber },
    });
    const toUpsert = {
      dossierDS: dossierDS.id,
      state: dossierDS.dataJson.state,
      demarche: demarcheEntity,
    };
    const result = await this._upsertDossier(
      toUpsert,
      transactionalEntityManager,
    );
    this.logger.debug(result);
    return result;
  }

  //TODO: remove and use parent method
  async findOne(id: number): Promise<Dossier> {
    this.logger.verbose("findOne");
    return await this.findOneById(id);
  }

  //TODO: remove and use parent method
  async findOneWithDetail(id: number): Promise<Dossier> {
    return await this.findOneById(id, { dossierDS: true, demarche: true });
  }
}
