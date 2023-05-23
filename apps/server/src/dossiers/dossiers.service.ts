import { Injectable, Logger } from "@nestjs/common";
import { Demarche, Dossier, DossierDS } from "../entities";
import { LoggerService } from "../logger/logger.service";
import { EntityManager, InsertResult } from "typeorm";

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
