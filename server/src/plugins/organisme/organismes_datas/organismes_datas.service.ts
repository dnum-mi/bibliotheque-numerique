import { Injectable, Logger } from "@nestjs/common";
import { LoggerService } from "logger/logger.service";
import { ConnectorService } from "../../../connector/connector.service";
import { DataSource } from "typeorm";
import { OrganismesData } from "../entities";
import { Connector } from "../../../entities";

@Injectable()
export class OrganismesDatasService {
  private readonly logger = new Logger(
    OrganismesDatasService.name,
  ) as unknown as LoggerService;

  constructor(
    private dataSource: DataSource,
    private connectorService: ConnectorService,
  ) {}

  findAll() {
    return OrganismesData.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} organismesData`;
  }

  remove(id: number) {
    return `This action removes a #${id} organismesData`;
  }

  async findOneByIdRNA(idRef: string) {
    // return OrganismesData.findOneByOrFail({  idRef  }, { relation });
    const organismeData = await OrganismesData.findOne({
      where: { idRef },
      relations: { organismesSource: true },
    });
    return {
      ...organismeData,
      organismesSource: organismeData.organismesSource.name,
    };
  }

  async createOrUpdate(
    idRna: string,
    connectorApi: Connector,
    organismeDataFromSource: any,
  ) {
    try {
      let organimseData = await OrganismesData.findOneBy({
        idRef: idRna,
        organismesSource: { id: connectorApi.id },
      });

      if (!organimseData) {
        organimseData = new OrganismesData();
        organimseData.idRef = idRna;
        organimseData.organismesSource = connectorApi;
      }
      //Seulement pour RNA
      const dateMiseAJours = new Date(organismeDataFromSource.mise_a_jour);

      if (organimseData.dataUpdateAt?.getTime() === dateMiseAJours.getTime()) {
        const message = `No update or no create organisme data for ${idRna} with ${connectorApi.name}`;
        this.logger.warn({
          short_message: message,
          full_message: message,
        });
        return false;
      }
      organimseData.dataUpdateAt = dateMiseAJours;
      organimseData.dataJson = organismeDataFromSource;

      await this.dataSource.transaction(async (transactionalEntityManager) => {
        transactionalEntityManager.save(organimseData);
      });
      return true;
    } catch (error) {
      this.logger.error({
        short_message: "No Orgaisme_data to upsert",
        full_message: error.stack,
      });
      throw new Error("Unable to upsert organisme_data");
    }
  }

  async findAndAddByIdRna(idRna: string, connectorApi: Connector) {
    let organismeDataFromSource;
    try {
      //TODO: A revoir comment il y a plusieur comment savoir quoi mettre
      const params = connectorApi?.params?.reduce(
        (acc, key) => ({ ...acc, [key]: idRna }),
        {},
      );

      const result = await this.connectorService.getResult(
        connectorApi,
        params,
        //TODO: uniquement pour API entreprise
        connectorApi.query,
      );

      //TODO: uniquement pour API entrepris
      organismeDataFromSource = result?.data?.data;

      if (!organismeDataFromSource) {
        this.logger.warn({
          short_message: `No found orgnasition from extern api for ${idRna} with ${connectorApi.name}`,
          full_message: `No found orgnasition from extern api for ${idRna} with ${connectorApi.name}`,
        });

        return false;
      }
    } catch (error) {
      this.logger.error({
        short_message: "No found orgnasition from extern api",
        full_message: error.stack,
      });
      throw new Error("Unable to upsert organisme_data");
    }
    return await this.createOrUpdate(
      idRna,
      connectorApi,
      organismeDataFromSource,
    );
  }

  async findAndAddByIdRnaFromAllApi(idRna: string) {
    try {
      const connectorApis = await Connector.find({});

      return await Promise.allSettled(
        connectorApis.map(async (connectorApi) =>
          this.findAndAddByIdRna(idRna, connectorApi),
        ),
      );
    } catch (error) {
      this.logger.error({
        short_message: "No Orgaisme_data to upsert",
        full_message: error.stack,
      });
      throw new Error("Unable to upsert organisme_data");
    }
  }
}
