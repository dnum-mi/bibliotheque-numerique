import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { Organisme, OrganismesData } from "../entities";
import { OrganismesDatasService } from "../organismes_datas/organismes_datas.service";
import { ParseToOrganismesService } from "../parserByConnector/parse_to_organismes.service";

@Injectable()
export class OrganismesService {
  constructor(
    private dataSource: DataSource,
    private parserToOrganismes: ParseToOrganismesService,
    private organismesDatasService: OrganismesDatasService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  findAll(): Promise<Organisme[]> {
    return Organisme.find();
  }

  findOneById(id: number): Promise<Organisme> {
    return Organisme.findOne({
      where: { id },
      relations: { organismeDatas: true },
    });
  }

  findOneByIdRef(idRef: string): Promise<Organisme> {
    return Organisme.findOne({
      where: { idRef },
    });
  }

  async upsertOrganisme(idRef: string, sources: string[]): Promise<Organisme> {
    let organismeDatas: OrganismesData[] = [];
    await this.organismesDatasService.findAndAddByIdRnaFromAllApi(
      idRef,
      sources,
    );
    organismeDatas = await this.organismesDatasService.findByIdRNA(idRef);

    if (organismeDatas?.length === 0) {
      throw new NotFoundException(`No datas for ${idRef}`);
    }

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
  }
}
