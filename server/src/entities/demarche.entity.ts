import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { DemarcheDSEntity } from "./demarche_ds.entity";
import { DossierEntity } from "./dossier.entity";

@Entity({ name: "demarches" })
export class DemarcheEntity {
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

  @OneToMany(() => DossierEntity, (dossier) => dossier.demarche)
  dossiers: DossierEntity[];

  @Column()
  state: string;

  @Column()
  title: string;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;
}
