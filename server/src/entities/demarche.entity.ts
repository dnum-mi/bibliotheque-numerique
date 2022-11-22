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
import { Dossier, DemarcheDS } from "../entities";

@Entity({ name: "demarches" })
export class Demarche extends BaseEntity {
  @PrimaryGeneratedColumn("increment", {
    type: "int",
    unsigned: true,
    primaryKeyConstraintName: "pk_demarche_id",
  })
  id: number;

  @OneToOne(() => DemarcheDS)
  @JoinColumn({
    name: "idDemarcheDS",
    referencedColumnName: "id",
    foreignKeyConstraintName: "fk_demarche_ds_id",
  })
  demarcheDS: DemarcheDS;

  @OneToMany(() => Dossier, (dossier) => dossier.demarche)
  dossiers: Dossier[];

  @Column()
  state: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  typeOrganisme: string;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;
}
