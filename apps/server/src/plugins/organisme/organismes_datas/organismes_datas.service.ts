import { Injectable, Logger } from "@nestjs/common";
import { LoggerService } from "logger/logger.service";
import { ConnectorService } from "../../../connector/connector.service";
import { DataSource } from "typeorm";
import { OrganismesData } from "../entities";
import { Connector } from "../../../entities";
import {
  ParseToOrganismesService,
  TParseToOrganisme,
} from "../parserByConnector/parse_to_organismes.service";

@Injectable()
export class OrganismesDatasService {
  private readonly logger = new Logger(
    OrganismesDatasService.name,
  ) as unknown as LoggerService;

  constructor(
    private dataSource: DataSource,
    private connectorService: ConnectorService,
    private parser2Organismes: ParseToOrganismesService,
  ) {}

  async findAll() {
    const organismeDatas = await OrganismesData.find({
      relations: { organismesSource: true },
    });
    return organismeDatas.map((organismeData) => ({
      ...organismeData,
      organismesSource: organismeData.organismesSource.name,
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} organismesData`;
  }

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
  ) {
    try {
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
    } catch (error) {
      this.logger.error({
        short_message: "No organisme_data to upsert",
        full_message: error.stack,
        error,
        datas: { idRna, connectorApi, parser },
      });
      throw new Error("Unable to upsert organisme_data");
    }
  }

  async findAndAddByIdRna(idRna: string, connectorApi: Connector) {
    const parser = this.parser2Organismes.getParser(connectorApi.name)();

    try {
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
    } catch (error) {
      this.logger.error({
        short_message: "No found organisation from extern api",
        full_message: error.stack,
      });
      throw new Error("Unable to upsert organisme_data");
    }
    return await this.createOrUpdate(idRna, connectorApi, parser);
  }

  async findAndAddByIdRnaFromAllApi(idRna: string, sources: string[]) {
    let connectorApisSelected;
    try {
      const connectorApis = await Connector.find({});
      connectorApisSelected = sources?.length
        ? connectorApis.filter((connector) => sources.includes(connector.name))
        : connectorApis;
    } catch (error) {
      const message = "Error intern to get connectors";
      this.logger.error({
        short_message: message,
        full_message: error.stack,
      });
      throw new Error(message);
    }

    if (!connectorApisSelected || !connectorApisSelected.length) {
      throw new Error(`Error Connectors not found: ${sources}`);
    }

    try {
      return await Promise.allSettled(
        connectorApisSelected.map(async (connectorApi) =>
          this.findAndAddByIdRna(idRna, connectorApi),
        ),
      );
    } catch (error) {
      this.logger.error({
        short_message: "No organisme_data to upsert",
        full_message: error.stack,
      });
      throw new Error("Unable to upsert organisme_data");
    }
  }
}
