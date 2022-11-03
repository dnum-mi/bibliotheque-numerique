import {
  BaseEntity,
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Dossier } from "@lab-mi/ds-api-client/dist/@types/types";

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

  static async tryUpsertDossierDS(dossier: Partial<Dossier>) {
    await DossierDS.upsert(
      {
        id: dossier.number,
        dataJson: dossier,
        dsUpdateAt: dossier.dateDerniereModification,
      },
      {
        conflictPaths: ["id"],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }
}
