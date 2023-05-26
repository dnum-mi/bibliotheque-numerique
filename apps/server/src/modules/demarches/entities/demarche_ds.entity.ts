import { Entity, Column, PrimaryColumn, EntityManager } from "typeorm";
import { Demarche as TDemarche } from "@dnum-mi/ds-api-client/dist/@types/types";
import { ApplicationEntity } from "../../../shared/entities/application_entity";

@Entity({ name: "demarches_ds" })
export class DemarcheDS extends ApplicationEntity {
  @PrimaryColumn("int", { primaryKeyConstraintName: "PK_DEMARCHE_DS_ID" })
  id: number;

  @Column({ type: "jsonb" })
  dataJson: Partial<TDemarche>;

  @Column({ type: "timestamp" })
  dsUpdateAt: Date;

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static upsertDemarcheDS(
    toUpsert: Partial<DemarcheDS> | Partial<DemarcheDS>[],
    transactionalEntityManager: EntityManager,
  ) {
    return transactionalEntityManager
      .createQueryBuilder()
      .insert()
      .into(DemarcheDS)
      .values(toUpsert)
      .orUpdate(["dataJson", "updateAt", "dsUpdateAt"], "PK_DEMARCHE_DS_ID", {
        skipUpdateIfNoValuesChanged: true,
      })
      .returning(["id", "dataJson"])
      .execute();
  }
}
