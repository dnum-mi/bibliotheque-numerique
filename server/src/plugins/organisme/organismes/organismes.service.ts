import { Injectable, Logger } from "@nestjs/common";
import { LoggerService } from "../../../logger/logger.service";
import { Organisme } from "../entities";

@Injectable()
export class OrganismesService {
  private readonly logger = new Logger(
    OrganismesService.name,
  ) as unknown as LoggerService;

  findAll() {
    try {
      return Organisme.find();
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération des organismes",
        full_message: error.toString(),
      });
      throw new Error("Unable to retrieve demarches");
    }
  }

  findOne(id: number) {
    try {
      return Organisme.findOneById(id);
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération des organismes",
        full_message: error.toString(),
      });
      throw new Error("Unable to retrieve demarches");
    }
  }
}
