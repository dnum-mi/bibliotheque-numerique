import { Injectable, Logger } from "@nestjs/common";
import { LoggerService } from "logger/logger.service";
import { ConnectorService } from "../../connector/connector.service";
import { DataSource } from "typeorm";
import { OrganismesData, OrganismesSource } from "../entities";

@Injectable()
export class OrganismesDatasService {
  private readonly logger = new Logger(
    OrganismesDatasService.name,
  ) as unknown as LoggerService;

  constructor(
    private dataSource: DataSource,
    private connectorService: ConnectorService<OrganismesSource>,
  ) {}

  findAll() {
    return `This action returns all organismesDatas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} organismesData`;
  }

  remove(id: number) {
    return `This action removes a #${id} organismesData`;
  }

  async createOrUpdate(
    idRna: string,
    orgSrc: OrganismesSource,
    organismeDataFromSource: any,
  ) {
    try {
      let organimseData = await OrganismesData.findOneBy({
        idRef: idRna,
        organismesSource: { id: orgSrc.id },
      });

      if (!organimseData) {
        organimseData = new OrganismesData();
        organimseData.idRef = idRna;
        organimseData.organismesSource = orgSrc;
      }
      //Seulement pour RNA
      const dateMiseAJours = new Date(organismeDataFromSource.mise_a_jour);

      if (organimseData.dataUpdateAt?.getTime() === dateMiseAJours.getTime()) {
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
  /**
   * Recherche les données dans api RNA
   * Enregistre dans le db
   * @param idRna
   * @param orgSrc
   */
  async findAndAddByIdRna(idRna: string, orgSrc: OrganismesSource) {
    let organismeDataFromSource;
    try {
      //TODO: A revoir comment il y a plusieur comment savoir quoi mettre
      const params = orgSrc?.params?.reduce(
        (acc, key) => ({ ...acc, [key]: idRna }),
        {},
      );

      const result = await this.connectorService.getResult(
        orgSrc,
        params,
        //TODO: uniquement pour API entreprise
        orgSrc.query,
      );

      //TODO: uniquement pour API entrepris
      organismeDataFromSource = result?.data?.data;

      if (!organismeDataFromSource) {
        this.logger.warn({
          short_message: `No found orgnasition from extern api for ${idRna} with ${orgSrc.sourceName}`,
          full_message: `No found orgnasition from extern api for ${idRna} with ${orgSrc.sourceName}`,
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
    return await this.createOrUpdate(idRna, orgSrc, organismeDataFromSource);
  }

  async findAndAddByIdRnaFromAllApi(idRna: string) {
    try {
      const orgSrcs = await OrganismesSource.find({});

      return await Promise.all(
        orgSrcs.map(async (orgSrc) => this.findAndAddByIdRna(idRna, orgSrc)),
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
