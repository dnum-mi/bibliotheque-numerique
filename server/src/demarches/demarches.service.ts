import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Demarche as TDemarche } from "@lab-mi/ds-api-client/dist/@types/types";
import { InsertResult, Repository } from "typeorm";
import { Demarche } from "../entities";
import { LoggerService } from "../logger/logger.service";

@Injectable()
export class DemarchesService {
  private readonly logger = new Logger(
    DemarchesService.name,
  ) as unknown as LoggerService;

  constructor(
    @InjectRepository(Demarche)
    private demarchesRepository: Repository<Demarche>,
  ) {}

  private _typeOrganismeFromDemarcheDs(
    demarche: TDemarche,
  ): string | undefined {
    const TypeOrganisme = {
      FDD: /^FDD$/,
      FE: /^FE$/,
      ARUP: /^ARUP$/,
      FRUP: /^FRUP$/,
      W9: /^W\d{9}$/,
    };
    const annotationDescriptors =
      demarche.publishedRevision?.annotationDescriptors;

    if (!annotationDescriptors || annotationDescriptors.length === 0)
      return undefined;

    for (const annotationDescriptor of annotationDescriptors) {
      for (const typeOrganisme of Object.keys(TypeOrganisme) as Array<
        keyof typeof TypeOrganisme
      >) {
        if (annotationDescriptor.label.includes("organisme")) {
          const descriptionMatch = annotationDescriptor.description.match(
            TypeOrganisme[typeOrganisme],
          );
          if (descriptionMatch) {
            return descriptionMatch[0];
          }
        }
      }
    }
    return undefined;
  }

  async updateDemarches(demarches: TDemarche[]): Promise<InsertResult> {
    const toUpsert = demarches.map((demarche) => ({
      demarcheDS: demarche.id,
      title: demarche.title,
      state: demarche.state,
      typeOrganisme: this._typeOrganismeFromDemarcheDs(demarche),
    }));
    try {
      return await this.demarchesRepository
        .createQueryBuilder()
        .insert()
        .into(Demarche)
        .values(toUpsert as Partial<Demarche>)
        .orUpdate(
          ["title", "state", "typeOrganisme", "updateAt"],
          ["idDemarcheDS"],
          {
            skipUpdateIfNoValuesChanged: true,
          },
        )
        .execute();
    } catch (error) {
      this.logger.error({
        short_message: `Erreur pendant la mise à jour des démarches numéros: ${demarches
          .map((d) => d.id)
          .toString()}`,
        full_message: error.toString(),
      });
      throw new Error("Unable to update demarches");
    }
  }

  async findById(id: number): Promise<Demarche> {
    try {
      return await this.demarchesRepository.findOne({
        where: { id },
        relations: { demarcheDS: true, dossiers: { dossierDS: true } },
      });
    } catch (error) {
      this.logger.error({
        short_message: `Échec récupération de la démarche id: ${id}`,
        full_message: error.toString(),
      });
      throw new Error(`Unable to retrieve demarche id: ${id}`);
    }
  }

  async findByDsId(id: number): Promise<Demarche> {
    try {
      return await this.demarchesRepository.findOne({
        where: { demarcheDS: { id } },
        relations: { demarcheDS: true },
      });
    } catch (error) {
      this.logger.error({
        short_message: `Échec récupération de la démarche number: ${id}`,
        full_message: error.toString(),
      });
      throw new Error(`Unable to retrieve demarche number: ${id}`);
    }
  }

  async findAll(filter: object = {}): Promise<Demarche[]> {
    try {
      console.log(filter);
      return await this.demarchesRepository.find({
        where: {
          ...filter,
        },
        relations: {
          demarcheDS: true,
        },
      });
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération des démarches",
        full_message: error.toString(),
      });
      throw new Error("Unable to retrieve demarches");
    }
  }
}
