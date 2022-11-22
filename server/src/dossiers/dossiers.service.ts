import { Injectable, Logger } from "@nestjs/common";
import { Dossier } from "../entities";
import { LoggerService } from "../logger/logger.service";

@Injectable()
export class DossiersService {
  private readonly logger = new Logger(
    DossiersService.name,
  ) as unknown as LoggerService;

  async findAll(filter: object = {}) {
    try {
      return await Dossier.all(filter);
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
