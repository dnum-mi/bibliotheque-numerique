import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { LoggerService } from "../../../logger/logger.service";
import { Organisme, OrganismesData } from "../entities";
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

  findOneById(id: number) {
    try {
      return Organisme.findOne({
        where: { id },
        relations: { organismeDatas: true },
      });
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération des organismes",
        full_message: error.toString(),
      });
      throw new Error("Unable to retrieve demarches");
    }
  }

  findOneByIdRef(idRef: string) {
    try {
      return Organisme.findOne({
        where: { idRef },
      });
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération des organismes",
        full_message: error.toString(),
      });
      throw new Error("Unable to retrieve demarches");
    }
  }

  async upsertOrganisme(idRef: string, sources: string[]) {
    let organismeDatas: OrganismesData[] = [];
    try {
      await this.organismesDatasService.findAndAddByIdRnaFromAllApi(
        idRef,
        sources,
      );

      organismeDatas = await this.organismesDatasService.findByIdRNA(idRef);
    } catch (error) {
      this.logger.error({
        short_message: `Échec de récupération d'un organisme: ${idRef}`,
        full_message: error.stack,
      });
      throw new Error(`Unable to upload organisme ${idRef}`);
    }

    if (organismeDatas?.length === 0) {
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
      // TODO: Manque une règle pour sélectionner l'organisme datas correcte
      if (
        !organisme.id ||
        organisme.updateAt?.getTime() < organismeDatas[0].dataUpdateAt.getTime()
      ) {
        //TODO: A revoir pour une solution pour instancier 1 fois le parser
        const parser = this.parserToOrganismes.getParser(
          organismeDatas[0].organismesSource.name,
        )();

        organisme = parser.toOrganismeEntity(
          organisme,
          organismeDatas[0].dataJson,
        );
        organisme.organismeDatas = organismeDatas;
        return await organisme.save();
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
