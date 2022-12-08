import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";
import { Demarche as TDemarche } from "@lab-mi/ds-api-client/dist/@types/types";

@Entity({ name: "demarches_ds" })
export class DemarcheDS extends BaseEntity {
  @PrimaryColumn("int", { primaryKeyConstraintName: "pk_demarche_ds_id" })
  id: number;

  @Column({ type: "jsonb" })
  dataJson: Partial<TDemarche>;

  @Column({ type: "timestamp" })
  dsUpdateAt: Date;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;

  static upsertDemarcheDS(
    toUpsert: Partial<DemarcheDS> | Partial<DemarcheDS>[],
  ) {
    return this.createQueryBuilder()
      .insert()
      .into(DemarcheDS)
      .values(toUpsert)
      .orUpdate(["dataJson", "updateAt", "dsUpdateAt"], "pk_demarche_ds_id", {
        skipUpdateIfNoValuesChanged: true,
      })
      .returning(["id", "dataJson"])
      .execute();
  }
}
