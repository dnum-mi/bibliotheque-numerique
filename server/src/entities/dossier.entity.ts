import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  InsertResult,
} from "typeorm";
import { DossierDS, Demarche } from "../entities";
import { Dossier as TDossier } from "@lab-mi/ds-api-client/dist/@types/types";

@Entity({ name: "dossiers" })
export class Dossier extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @OneToOne(() => DossierDS)
  @JoinColumn()
  dossierDS: DossierDS;

  @ManyToOne(() => Demarche, (demarche) => demarche.dossiers)
  @JoinColumn()
  demarche: Demarche;

  @Column({ type: "varchar" })
  state: string;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;

  static all() {
    return this.find({
      relations: {
        dossierDS: true,
      },
    });
  }

  static async upsertByDossierDS(
    apiDossier: Partial<TDossier>,
    dossierDS: InsertResult,
    demarcheEntity: Demarche,
  ) {
    return await Dossier.upsert(
      {
        dossierDS: dossierDS.identifiers[0].id,
        demarche: demarcheEntity,
        state: apiDossier.state,
      },
      {
        conflictPaths: ["dossierDS"],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }
}
