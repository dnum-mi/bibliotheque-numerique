import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Demarche } from "@lab-mi/ds-api-client/dist/@types/types";

@Entity({ name: "demarches_ds" })
export class DemarcheDSEntity {
  @PrimaryColumn("int", { primaryKeyConstraintName: "pk_demarche_ds_id" })
  id: number;

  @Column({ type: "jsonb" })
  dataJson: Demarche;

  @Column({ type: "timestamp" })
  dsUpdateAt: Date;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;
}
