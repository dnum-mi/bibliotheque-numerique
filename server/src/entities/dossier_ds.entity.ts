import {
  BaseEntity,
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Dossier as TDossier } from "@lab-mi/ds-api-client/dist/@types/types";

@Entity({ name: "dossiers_ds" })
export class DossierDS extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: "jsonb" })
  dataJson: Partial<TDossier>;

  @Column({ type: "timestamp" })
  dsUpdateAt: Date;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;

  static upsertDossierDS(toUpsert: Partial<DossierDS> | Partial<DossierDS>[]) {
    return this.createQueryBuilder()
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
