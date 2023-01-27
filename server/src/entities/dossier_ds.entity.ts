import { Entity, Column, PrimaryColumn, EntityManager } from "typeorm";
import { Dossier as TDossier } from "@lab-mi/ds-api-client/dist/@types/types";
import { ApplicationEntity } from "./applicationEntity";

@Entity({ name: "dossiers_ds" })
export class DossierDS extends ApplicationEntity {
  @PrimaryColumn({ primaryKeyConstraintName: "PK_DOSSIER_DS_ID" })
  id: number;

  @Column({ type: "jsonb" })
  dataJson: Partial<TDossier>;

  @Column({ type: "timestamp" })
  dsUpdateAt: Date;

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
