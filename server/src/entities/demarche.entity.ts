import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";
import { DemarcheDSEntity } from "./demarche_ds.entity";
import { Dossier } from "./dossier.entity";

@Entity({ name: "demarches" })
export class DemarcheEntity extends BaseEntity {
  @PrimaryGeneratedColumn("increment", {
    type: "int",
    unsigned: true,
    primaryKeyConstraintName: "pk_demarche_id",
  })
  id: number;

  @OneToOne(() => DemarcheDSEntity)
  @JoinColumn({
    name: "idDemarcheDS",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_demarche_ds_id",
  })
  demarcheDS: DemarcheDSEntity;

  @OneToMany(() => Dossier, (dossier) => dossier.demarche)
  dossiers: Dossier[];

  @Column()
  state: string;

  @Column()
  title: string;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;
}
