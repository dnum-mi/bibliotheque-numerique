import { Injectable } from "@nestjs/common";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { ConnectorService } from "../../../modules/connector/connector.service";
import { DataSource } from "typeorm";

import {
  ParseToOrganismesService,
  TParseToOrganisme,
} from "../parserByConnector/parse_to_organismes.service";
import { Connector } from "../../../modules/connector/connector.entity";
import { OrganismesData } from "./organisme_data.entity";

@Injectable()
export class OrganismesDatasService {
  constructor(
    private dataSource: DataSource,
    private connectorService: ConnectorService,
    private parser2Organismes: ParseToOrganismesService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async findAll() {
    const organismeDatas = await OrganismesData.find({
      relations: { organismesSource: true },
    });
    return organismeDatas.map((organismeData) => ({
      ...organismeData,
      organismesSource: organismeData.organismesSource.name,
    }));
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  findOne(id: number) {
    return `This action returns a #${id} organismesData`;
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  remove(id: number) {
    return `This action removes a #${id} organismesData`;
  }

  async findByIdRNA(idRef: string): Promise<OrganismesData[]> {
    const organismesDatas = await OrganismesData.find({
      where: { idRef },
      relations: { organismesSource: true },
    });
    return organismesDatas || [];
  }

  async createOrUpdate(
    idRna: string,
    connectorApi: Connector,
    parser: TParseToOrganisme,
  ): Promise<boolean> {
    let organismeData = await OrganismesData.findOneBy({
      idRef: idRna,
      organismesSource: { id: connectorApi.id },
    });

    if (!organismeData) {
      organismeData = new OrganismesData();
      organismeData.idRef = idRna;
      organismeData.organismesSource = connectorApi;
    }

    const dateMiseAJours = parser.getDataUpdateAt();

    if (organismeData.dataUpdateAt?.getTime() === dateMiseAJours.getTime()) {
      console.log('ici')
      const message = `No update or no create organisme data for ${idRna} with ${connectorApi.name}`;
      this.logger.warn({
        short_message: message,
        full_message: message,
      });
      return false;
    }
    organismeData.dataUpdateAt = dateMiseAJours;
    organismeData.dataJson = JSON.parse(JSON.stringify(parser.dataJson));

    await organismeData.save();
    return true;
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async findAndAddByIdRna(idRna: string, connectorApi: Connector) {
    const parser = this.parser2Organismes.getParser(connectorApi.name)();

    //TODO: A revoir quand il y en a plusieurs comment savoir quoi mettre
    const params = connectorApi?.params?.reduce(
      (acc, key) => ({ ...acc, [key]: idRna }),
      {},
    );

    const result = await this.connectorService.getResult(
      connectorApi,
      params,
      connectorApi.query,
    );

    parser.setDataJson(result);

    if (!parser.dataJson) {
      this.logger.warn({
        short_message: `No found organisation from extern api for ${idRna} with ${connectorApi.name}`,
        full_message: `No found organisation from extern api for ${idRna} with ${connectorApi.name}`,
      });

      return false;
    }

    return await this.createOrUpdate(idRna, connectorApi, parser);
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async findAndAddByIdRnaFromAllApi(idRna: string, sources: string[]) {
    const connectorApis = await this.connectorService.repository.find({});
    const connectorApisSelected = sources?.length
      ? connectorApis.filter((connector) => sources.includes(connector.name))
      : connectorApis;

    if (!connectorApisSelected || !connectorApisSelected.length) {
      throw new Error(`Error Connectors not found: ${sources}`);
    }

    return await Promise.allSettled(
      connectorApisSelected.map(async (connectorApi) =>
        this.findAndAddByIdRna(idRna, connectorApi),
      ),
    );
  }
}
