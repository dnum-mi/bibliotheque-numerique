import { Injectable, NotFoundException } from "@nestjs/common";
import { EntityManager, In, InsertResult } from "typeorm";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { ConfigService } from "@nestjs/config";
import { PermissionName } from "../../../shared/types/Permission.type";
import { TConfig } from "../../../config/configuration";
import { DemarcheDS } from "../entities/demarche_ds.entity";
import { Demarche, TUpsertDemarche } from "../entities/demarche.entity";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class DemarchesService {
  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {}

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
    return await Demarche.upsertDemarche(toUpsert, transactionalEntityManager);
  }

  async findById(id: number): Promise<Demarche> {
    return await Demarche.findById(id);
  }

  async findByDsId(id: number): Promise<Demarche> {
    return await Demarche.findByDsId(id);
  }

  async findWithFilter(user: User, filter: object = {}): Promise<Demarche[]> {
    return Demarche.findWithFilter({
      ...filter,
      ...this._getFiltersFromUserPermissions(user),
    });
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
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

  async updateDemarche(id: number, demarche: Partial<Demarche>): Promise<void> {
    const result = await Demarche.update(id, demarche);
    if (result.affected === 0) {
      throw new NotFoundException(`Demarche id: ${id} not found`);
    }
  }

  private _getFiltersFromUserPermissions(user: User): object {
    const rules = this.getRulesFromUserPermissions(user);
    return {
      demarcheDS:
        rules?.demarcheDS?.length > 0 ? In(rules?.demarcheDS) : undefined,
    };
  }
}
