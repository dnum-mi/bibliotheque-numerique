import { Injectable } from "@nestjs/common";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { EntityManager, InsertResult } from "typeorm";
import { Demarche } from "../../demarches/entities/demarche.entity";
import { DossierDS } from "../entities/dossier_ds.entity";
import { Dossier } from "../entities/dossier.entity";

@Injectable()
export class DossiersService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
  }

  async upsertDossier(
    dossierDS: DossierDS,
    demarcheNumber: number,
    transactionalEntityManager: EntityManager,
  ): Promise<InsertResult> {
    const demarcheEntity = await Demarche.findOneBy({
      demarcheDS: { id: demarcheNumber },
    });
    const toUpsert = {
      dossierDS: dossierDS.id,
      state: dossierDS.dataJson.state,
      demarche: demarcheEntity,
    };
    const result = await Dossier.upsertDossier(
      toUpsert,
      transactionalEntityManager,
    );
    this.logger.debug(result);
    return result;
  }

  async findWithFilter(filter: object = {}): Promise<Dossier[]> {
    return await Dossier.findWithFilter(filter);
  }

  async findOne(id: number): Promise<Dossier> {
    return await Dossier.findOneBy({ id: id });
  }

  async findOneWithDetail(id: number): Promise<Dossier> {
    return await Dossier.findOne({
      where: { id: id },
      relations: { dossierDS: true },
    });
  }

  async remove(id: number): Promise<Dossier | void> {
    const dossier = await Dossier.findOneBy({ id: id });
    if (dossier) {
      return dossier.remove();
    } else {
      this.logger.warn("Dossier not found. Cannot perform remove.");
    }
  }
}
