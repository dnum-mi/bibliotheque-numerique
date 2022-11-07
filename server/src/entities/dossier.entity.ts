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
import { DossierDS } from "./dossier_ds.entity";
import { DemarcheEntity } from "./demarche.entity";
import { Dossier as TDossier } from "@lab-mi/ds-api-client/dist/@types/types";

@Entity()
export class Dossier extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @OneToOne(() => DossierDS)
  @JoinColumn()
  dossierDS: DossierDS;

  @ManyToOne(() => DemarcheEntity, (demarche) => demarche.dossiers)
  @JoinColumn()
  demarche: DemarcheEntity;

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
    demarcheEntity: DemarcheEntity,
  ) {
    await Dossier.upsert(
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
