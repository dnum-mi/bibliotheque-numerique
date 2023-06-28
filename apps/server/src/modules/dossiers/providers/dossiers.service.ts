import { Injectable, Logger } from "@nestjs/common";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { EntityManager, InsertResult } from "typeorm";
import { Demarche } from "../../demarches/entities/demarche.entity";
import { DossierDS } from "../entities/dossier_ds.entity";
import { Dossier } from "../entities/dossier.entity";

@Injectable()
export class DossiersService {
  private readonly logger = new Logger(
    DossiersService.name,
  ) as unknown as LoggerService;

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
    try {
      const result = await Dossier.upsertDossier(
        toUpsert,
        transactionalEntityManager,
      );
      this.logger.debug({
        short_message: "debug upsert Dossier",
        full_message: "debug upsert Dossier",
        datas: result,
      });
      return result;
    } catch (error) {
      this.logger.error({
        short_message: `Erreur pendant la mise à jour des dossiers numéros: ${dossierDS.id.toString()}`,
        full_message: error.stack,
      });
      throw new Error("Unable to update dossiers");
    }
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async findWithFilter(filter: object = {}) {
    try {
      return await Dossier.findWithFilter(filter);
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération des dossiers",
        full_message: error.stack,
      });
      throw new Error("Unable to retrieve dossiers");
    }
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async findOne(id: number) {
    try {
      return await Dossier.findOneBy({ id: id });
    } catch (error) {
      this.logger.error({
        short_message: `Échec récupération du dossier id: ${id}`,
        full_message: error.stack,
      });
      throw new Error("Unable to retrieve dossiers");
    }
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async findOneWithDetail(id: number) {
    try {
      return await Dossier.findOne({
        where: { id: id },
        relations: { dossierDS: true },
      });
    } catch (error) {
      this.logger.error({
        short_message: `Échec récupération du dossier id: ${id}`,
        full_message: error.stack,
      });
      throw new Error(`Unable to retrieve dossier id: ${id}`);
    }
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async remove(id: number) {
    let dossier: Dossier;
    try {
      dossier = await Dossier.findOneBy({ id: id });
    } catch (error) {
      this.logger.error({
        short_message: `Échec récupération du dossier id: ${id}`,
        full_message: error.stack,
      });
      throw new Error(`Unable to retrieve dossier id: ${id}`);
    }

    if (dossier) {
      try {
        return await dossier.remove();
      } catch (error) {
        this.logger.error({
          short_message: `Échec suppression du dossier id: ${id}`,
          full_message: error.stack,
        });
        throw new Error(`Unable to remove dossier id: ${id}`);
      }
    }
  }
}
