import { Injectable, Logger } from "@nestjs/common";
import { EntityManager, In, InsertResult } from "typeorm";
import { Demarche, DemarcheDS, TUpsertDemarche, User } from "../entities";
import { LoggerService } from "../logger/logger.service";
import { ConfigService } from "@nestjs/config";
import { PermissionName } from "../types/Permission.type";
import { TConfig } from "../config/configuration";

@Injectable()
export class DemarchesService {
  private readonly logger = new Logger(
    DemarchesService.name,
  ) as unknown as LoggerService;

  constructor(private configService: ConfigService) {}

  private _typeOrganismeFromDemarcheDs(
    demarcheDS: DemarcheDS,
  ): string | undefined {
    const TypeOrganisme =
      this.configService.get<TConfig["typeOrganisme"]>("typeOrganisme");
    const annotationDescriptors =
      demarcheDS.dataJson.publishedRevision?.annotationDescriptors;

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

  async upsertDemarches(
    demarchesDS: DemarcheDS[],
    transactionalEntityManager: EntityManager,
  ): Promise<InsertResult> {
    const toUpsert = demarchesDS.map<TUpsertDemarche>((demarcheDS) => ({
      demarcheDS: demarcheDS.id,
      title: demarcheDS.dataJson.title,
      state: demarcheDS.dataJson.state,
      typeOrganisme: this._typeOrganismeFromDemarcheDs(demarcheDS),
    }));
    try {
      return await Demarche.upsertDemarche(
        toUpsert,
        transactionalEntityManager,
      );
    } catch (error) {
      this.logger.error({
        short_message: `Erreur pendant la mise à jour des démarches numéros: ${demarchesDS
          .map((d) => d.id)
          .toString()}`,
        full_message: error.toString(),
      });
      throw new Error("Unable to update demarches");
    }
  }

  async findById(id: number): Promise<Demarche> {
    try {
      return await Demarche.findById(id);
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
      return await Demarche.findByDsId(id);
    } catch (error) {
      this.logger.error({
        short_message: `Échec récupération de la démarche number: ${id}`,
        full_message: error.toString(),
      });
      throw new Error(`Unable to retrieve demarche number: ${id}`);
    }
  }

  async findWithFilter(user: User, filter: object = {}): Promise<Demarche[]> {
    try {
      return Demarche.findWithFilter({
        ...filter,
        ...this._getFiltersFromUserPermissions(user),
      });
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération des démarches",
        full_message: error.toString(),
      });
      throw new Error("Unable to retrieve demarches");
    }
  }

  getRulesFromUserPermissions(user: User): any {
    const { roles } = user;
    let demarcheIds: number[] = [];
    for (const role of roles) {
      if (
        role.name ===
        this.configService.get<TConfig["defaultAdmin"]["roleName"]>(
          "defaultAdmin.roleName",
        )
      ) {
        return {};
      }
      const permissionAccessDemarche = role.permissions.find(
        (p) => p.name === PermissionName.ACCESS_DEMARCHE,
      );
      if (permissionAccessDemarche) {
        demarcheIds = demarcheIds.concat(
          permissionAccessDemarche?.options?.demarcheIds || [],
        );
      }
    }
    return {
      demarcheDS: demarcheIds,
    };
  }
  private _getFiltersFromUserPermissions(user: User): object {
    const rules = this.getRulesFromUserPermissions(user);
    return {
      demarcheDS:
        rules?.demarcheDS?.length > 0 ? In(rules?.demarcheDS) : undefined,
    };
  }
}
