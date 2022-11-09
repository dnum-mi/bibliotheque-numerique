import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DsApiClient } from "@lab-mi/ds-api-client";
import { Demarche as TDemarche } from "@lab-mi/ds-api-client/dist/@types/types";
import { InsertResult, Repository } from "typeorm";
import { Demarche } from "../entities";

@Injectable()
export class DemarchesService {
  constructor(
    @InjectRepository(Demarche)
    private demarchesRepository: Repository<Demarche>,
  ) {}

  async updateDemarches(demarches: TDemarche[]): Promise<InsertResult> {
    const toUpsert = demarches.map((demarche) => ({
      demarcheDS: demarche.id,
      title: demarche.title,
      state: demarche.state,
    }));

    return this.demarchesRepository
      .createQueryBuilder()
      .insert()
      .into(Demarche)
      .values(toUpsert as Partial<Demarche>)
      .orUpdate(["title", "state", "updateAt"], ["idDemarcheDS"], {
        skipUpdateIfNoValuesChanged: true,
      })
      .execute();
  }

  findById(id: number): Promise<Demarche> {
    return this.demarchesRepository.findOne({
      where: { id },
      relations: { demarcheDS: true, dossiers: { dossierDS: true } },
    });
  }

  findByDsId(id: number): Promise<Demarche> {
    return this.demarchesRepository.findOne({
      where: { demarcheDS: { id } },
      relations: { demarcheDS: true },
    });
  }

  findAll(): Promise<Demarche[]> {
    return this.demarchesRepository.find({
      relations: {
        demarcheDS: true,
      },
    });
  }

  async getDemarche(id: number): Promise<{ demarche: Partial<TDemarche> }> {
    const dsApiClient = new DsApiClient(
      process.env.DS_API_URL,
      process.env.DS_API_TOKEN,
    );
    return await dsApiClient.demarche(id);
  }
}
