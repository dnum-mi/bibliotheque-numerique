import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DsApiClient } from "@lab-mi/ds-api-client";
import { Demarche } from "@lab-mi/ds-api-client/dist/@types/types";
import { InsertResult, Repository } from "typeorm";
import { DemarcheDSEntity, DemarcheEntity } from "../entities";
import { DemarchesDSService } from "../demarches_ds/demarches_ds.service";

@Injectable()
export class DemarchesService {
  constructor(
    @InjectRepository(DemarcheEntity)
    private demarchesRepository: Repository<DemarcheEntity>,
  ) {}

  async updateDemarches(demarches: Demarche[]): Promise<InsertResult> {
    const toUpsert = demarches.map((demarche) => ({
      demarcheDS: demarche.id,
      title: demarche.title,
      state: demarche.state,
    }));

    return this.demarchesRepository
      .createQueryBuilder()
      .insert()
      .into(DemarcheEntity)
      .values(toUpsert as Partial<DemarcheEntity>)
      .orUpdate(["title", "state", "updateAt"], ["idDemarcheDS"], {
        skipUpdateIfNoValuesChanged: true,
      })
      .execute();
  }

  findById(id: number): Promise<DemarcheEntity> {
    return this.demarchesRepository.findOne({
      where: { id },
      relations: { demarcheDS: true },
    });
  }

  findByDsId(id: number): Promise<DemarcheEntity> {
    return this.demarchesRepository.findOne({
      where: { demarcheDS: { id } },
      relations: { demarcheDS: true },
    });
  }

  findAll(): Promise<DemarcheEntity[]> {
    return this.demarchesRepository.find({
      relations: {
        demarcheDS: true,
      },
    });
  }

  async getDemarche(id: number): Promise<{ demarche: Partial<Demarche> }> {
    const dsApiClient = new DsApiClient(
      process.env.DS_API_URL,
      process.env.DS_API_TOKEN,
    );
    return await dsApiClient.demarche(id);
  }
}
