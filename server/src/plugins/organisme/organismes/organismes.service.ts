import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { LoggerService } from "../../../logger/logger.service";
import { Organisme } from "../entities";
import { OrganismesDatasService } from "../organismes_datas/organismes_datas.service";
import { ParseToOrganismesService } from "../parserByConnector/parse_to_organismes.service";

@Injectable()
export class OrganismesService {
  private readonly logger = new Logger(
    OrganismesService.name,
  ) as unknown as LoggerService;

  constructor(
    private dataSource: DataSource,
    private parserToOrganismes: ParseToOrganismesService,
    private organismesDatasService: OrganismesDatasService,
  ) {}

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

  async upsertOrganisme(idRef: string, sources: string[]) {
    let organismeDatas;
    try {
      await this.organismesDatasService.findAndAddByIdRnaFromAllApi(
        idRef,
        sources,
      );

      organismeDatas = await this.organismesDatasService.findOneByIdRNA(idRef);
    } catch (error) {
      this.logger.error({
        short_message: `Échec de récupération d'un organisme: ${idRef}`,
        full_message: error.stack,
      });
      throw new Error(`Unable to upload organisme ${idRef}`);
    }

    if (!organismeDatas) {
      const message = `No datas for ${idRef}`;
      this.logger.warn({
        short_message: message,
        full_message: message,
      });
      throw new NotFoundException(message);
    }

    try {
      let organisme = await Organisme.findOneBy({ idRef });

      if (!organisme) {
        organisme = new Organisme();
      }
      if (
        !organisme.id ||
        organisme.updateAt?.getTime() < organismeDatas.dataUpdateAt.getTime()
      ) {
        //TODO: A revoir pour une solution pour instancier 1 fois le parser
        const parser = this.parserToOrganismes.getParser(
          organismeDatas.organismesSource,
        )();

        organisme = parser.toOrganismeEntity(
          organisme,
          organismeDatas.dataJson,
        );
        return await this.dataSource.transaction(
          (transactionalEntityManager) => {
            return transactionalEntityManager.save(organisme);
          },
        );
      }
    } catch (error) {
      this.logger.error({
        short_message: "Échec création d'un organisme",
        full_message: error.stack,
      });
      throw new Error("Unable to create organisme");
    }
  }
}
