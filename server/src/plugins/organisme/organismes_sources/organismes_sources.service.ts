import { Injectable, Logger } from "@nestjs/common";
import { OrganismesSource } from "../entities";
import { LoggerService } from "../../../logger/logger.service";

@Injectable()
export class OrganismesSourcesService {
  private readonly logger = new Logger(
    OrganismesSourcesService.name,
  ) as unknown as LoggerService;

  async findAll() {
    try {
      return await OrganismesSource.find();
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération des sources d'Organismes",
        full_message: error.toString(),
      });
      throw new Error("Unable to retrieve organismesSources");
    }
  }

  async findOneById(id: number) {
    try {
      return await OrganismesSource.findOneBy({ id });
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération de la source organisme",
        full_message: error.toString(),
      });
      throw new Error("Unable to retrieve organismesSource");
    }
  }

  async findOneBySourceName(sourceName: string) {
    try {
      return await OrganismesSource.findOneBy({ sourceName });
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération de la source organisme",
        full_message: error.toString(),
      });
      throw new Error("Unable to retrieve organismesSource");
    }
  }

  async upsert(organismesSource: Partial<OrganismesSource>) {
    try {
      const upsertOrganismesSourceResult =
        await OrganismesSource.upsertOrganismesSource(organismesSource);
      return upsertOrganismesSourceResult.raw[0];
    } catch (error) {
      this.logger.error({
        short_message: "Échec création de la source d'organismes",
        full_message: error.toString(),
      });
      throw new Error("Unable to create organismesSource");
    }
  }

  async remove(id: number) {
    try {
      return await OrganismesSource.delete({ id });
    } catch (error) {
      this.logger.error({
        short_message: `Échec suppression de l'organisme source id: ${id}`,
        full_message: error.toString(),
      });
      throw new Error(`Unable to remove organismeSource id: ${id}`);
    }
  }
}
