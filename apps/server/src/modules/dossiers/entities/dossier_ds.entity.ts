import { Entity, Column, PrimaryColumn, EntityManager } from "typeorm";
import { Dossier as TDossier } from "@dnum-mi/ds-api-client/dist/@types/types";
import { ApplicationEntity } from "../../../shared/entities/application_entity";

@Entity({ name: "dossiers_ds" })
export class DossierDS extends ApplicationEntity {
  @PrimaryColumn({ primaryKeyConstraintName: "PK_DOSSIER_DS_ID" })
  id: number;

  @Column({ type: "jsonb" })
  dataJson: Partial<TDossier>;

  @Column({ type: "timestamp" })
  dsUpdateAt: Date;

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static upsertDossierDS(
    toUpsert: Partial<DossierDS> | Partial<DossierDS>[],
    transactionalEntityManager: EntityManager,
  ) {
    return transactionalEntityManager
      .createQueryBuilder()
      .insert()
      .into(DossierDS)
      .values(toUpsert)
      .orUpdate(["dataJson", "updateAt", "dsUpdateAt"], "PK_DOSSIER_DS_ID", {
        skipUpdateIfNoValuesChanged: true,
      })
      .returning(["id", "dataJson"])
      .execute();
  }
}
