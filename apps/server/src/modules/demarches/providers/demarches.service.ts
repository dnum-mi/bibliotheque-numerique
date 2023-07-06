import { Injectable } from "@nestjs/common";
import { EntityManager, In, InsertResult, Repository } from "typeorm";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { ConfigService } from "@nestjs/config";
import { PermissionName } from "../../../shared/types/Permission.type";
import { TConfig } from "../../../config/configuration";
import { DemarcheDS } from "../entities/demarche_ds.entity";
import { Demarche, TUpsertDemarche } from "../entities/demarche.entity";
import { User } from "../../users/entities/user.entity";
import { BaseEntityService } from "../../../shared/base-entity/base-entity.service";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere } from "typeorm/find-options/FindOptionsWhere";

@Injectable()
export class DemarchesService extends BaseEntityService<Demarche> {
  constructor(
    private configService: ConfigService,
    protected logger: LoggerService,
    @InjectRepository(Demarche) repo: Repository<Demarche>,
  ) {
    super(repo, logger);
    this.logger.setContext(this.constructor.name);
  }

  private async _upsertDemarche(
    toUpsert: TUpsertDemarche | TUpsertDemarche[],
    transactionalEntityManager: EntityManager,
  ): Promise<InsertResult> {
    this.logger.verbose("upsertDemarche");
    return transactionalEntityManager
      .createQueryBuilder()
      .insert()
      .into(Demarche)
      .values(<never>toUpsert)
      .orUpdate(
        ["title", "state", "typeOrganisme", "updateAt"],
        ["idDemarcheDS"],
        {
          skipUpdateIfNoValuesChanged: true,
        },
      )
      .execute();
  }

  private _typeOrganismeFromDemarcheDs(
    demarcheDS: DemarcheDS,
  ): string | undefined {
    this.logger.verbose("_typeOrganismeFromDemarcheDs");
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

  public getRulesFromUserPermissions(user: User): number[] | void {
    this.logger.verbose("getRulesFromUserPermissions");
    const { roles } = user;
    let demarcheIds: number[] = [];
    for (const role of roles) {
      if (
        role.name ===
        this.configService.get<TConfig["defaultAdmin"]["roleName"]>(
          "defaultAdmin.roleName",
        )
      ) {
        return;
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
    return demarcheIds;
  }

  async findById(id: number): Promise<Demarche> {
    this.logger.verbose("findById");
    return super.findOneById(id, {
      demarcheDS: true,
      dossiers: { dossierDS: true },
    });
  }

  async findByDsId(id: number): Promise<Demarche> {
    this.logger.verbose("findByDsId");
    return this.repo.findOne({
      where: { demarcheDS: { id } },
      relations: { demarcheDS: true },
    });
  }

  async upsertDemarches(
    demarchesDS: DemarcheDS[],
    transactionalEntityManager: EntityManager,
  ): Promise<InsertResult> {
    this.logger.verbose("upsertDemarches");
    const toUpsert = demarchesDS.map<TUpsertDemarche>((demarcheDS) => ({
      demarcheDS: demarcheDS.id,
      title: demarcheDS.dataJson.title,
      state: demarcheDS.dataJson.state,
      typeOrganisme: this._typeOrganismeFromDemarcheDs(demarcheDS),
    }));
    return await this._upsertDemarche(toUpsert, transactionalEntityManager);
  }

  async findWithPermissions(
    user: User,
    filter: FindOptionsWhere<Demarche> = {},
  ): Promise<Demarche[]> {
    this.logger.verbose("findWithPermissions");
    const query = {
      ...filter,
    };
    const ids = this.getRulesFromUserPermissions(user);
    if (ids) {
      query.demarcheDS = In(ids);
    }
    return super.findWithFilter(query);
  }

  async updateDemarche(id: number, demarche: Partial<Demarche>): Promise<void> {
    return this.updateOrThrow(id, demarche);
  }
}
