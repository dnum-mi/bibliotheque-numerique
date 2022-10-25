import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "dossiers_ds" })
export class DossierDSEntity {
  @PrimaryColumn("varchar", { primaryKeyConstraintName: "pk_dossier_ds_id" })
  id: string;

  @Column({ type: "jsonb" })
  dataJson: object;

  @Column({ type: "timestamp" })
  dsUpdateAt: Date;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;
}
