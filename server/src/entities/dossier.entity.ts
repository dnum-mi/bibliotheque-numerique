import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { DossierDSEntity } from "./dossier_ds.entity";
import { DemarcheEntity } from "./demarche.entity";

@Entity({ name: "dossiers" })
export class DossierEntity {
  @PrimaryGeneratedColumn("increment", {
    type: "int",
    unsigned: true,
    primaryKeyConstraintName: "pk_dossier_id",
  })
  id: number;

  @OneToOne(() => DossierDSEntity)
  @JoinColumn({ name: "idDossierDS", referencedColumnName: "id" })
  dossierDS: DossierDSEntity;

  @ManyToOne(() => DemarcheEntity, (demarche) => demarche.dossiers)
  @JoinColumn({ name: "idDemarche" })
  demarche: DemarcheEntity;

  @Column({ type: "varchar" })
  state: string;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;
}
