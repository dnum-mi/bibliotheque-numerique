import { Injectable, Logger } from "@nestjs/common";
import { Demarche, Dossier, DossierDS, TUpsertDossier } from "../entities";
import { LoggerService } from "../logger/logger.service";
import { InsertResult } from "typeorm";

@Injectable()
export class DossiersService {
  private readonly logger = new Logger(
    DossiersService.name,
  ) as unknown as LoggerService;

  async updateDossiers(
    dossiersDS: DossierDS[],
    demarcheNumber: number,
  ): Promise<InsertResult> {
    const demarcheEntity = await Demarche.findOneBy({
      demarcheDS: { id: demarcheNumber },
    });
    const toUpsert = dossiersDS.map<Partial<TUpsertDossier>>((dossierDS) => ({
      dossierDS: dossierDS.id,
      state: dossierDS.dataJson.state,
      demarche: demarcheEntity,
    }));
    try {
      return await Dossier.upsertDossier(toUpsert);
    } catch (error) {
      this.logger.error({
        short_message: `Erreur pendant la mise à jour des dossiers numéros: ${dossiersDS
          .map((d) => d.id)
          .toString()}`,
        full_message: error.toString(),
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
        full_message: error.toString(),
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
        full_message: error.toString(),
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
        full_message: error.toString(),
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
        full_message: error.toString(),
      });
      throw new Error(`Unable to retrieve dossier id: ${id}`);
    }

    if (dossier) {
      try {
        return await dossier.remove();
      } catch (error) {
        this.logger.error({
          short_message: `Échec suppression du dossier id: ${id}`,
          full_message: error.toString(),
        });
        throw new Error(`Unable to remove dossier id: ${id}`);
      }
    }
  }
}
