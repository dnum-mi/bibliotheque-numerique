import {
  BaseEntity,
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "dossiers_ds" })
export class DossierDS extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: "jsonb" })
  dataJson: object;

  @Column({ type: "timestamp" })
  dsUpdateAt: Date;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;
}
