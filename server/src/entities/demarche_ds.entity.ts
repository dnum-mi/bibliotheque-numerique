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
  dataJson: TDemarche;

  @Column({ type: "timestamp" })
  dsUpdateAt: Date;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;
}
