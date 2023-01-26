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

  /**
   * Recherche les données dans api RNA
   * Enregistre dans le db
   * @param idRna
   * @param orgSrc
   */
  async findAndAddByIdRna(idRna: string, orgSrc: OrganismesSource) {
    //TODO: service connector to find organisme
    let organismeDataFromSource;
    try {
      //TODO: A corriger quand le connecteur est pret
      organismeDataFromSource = await this.connectorService.getResult(
        orgSrc.url,
      );
      if (!organismeDataFromSource) {
        return false;
      }
    } catch (error) {
      this.logger.error({
        short_message: "No found orgnasition from extern api",
        full_message: error.stack,
      });
      throw new Error("Unable to upsert organisme_data");
    }

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
      const dateMiseAJours = new Date(organismeDataFromSource.mise_a_jour);

      if (organimseData.dataUpdateAt?.getTime() === dateMiseAJours.getTime()) {
        return false;
      }
      organimseData.dataUpdateAt = dateMiseAJours;
      organimseData.dataJson = organismeDataFromSource;

      await this.dataSource.transaction(async (transactionalEntityManager) => {
        transactionalEntityManager.save(organimseData);
        // await OrganismesData.upsertOrganismeData(
        //   toUpsert,
        //   transactionalEntityManager,
        // );
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
}
