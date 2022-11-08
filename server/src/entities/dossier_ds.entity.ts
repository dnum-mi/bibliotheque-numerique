import {
  BaseEntity,
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Dossier as TDossier } from "@lab-mi/ds-api-client/dist/@types/types";
import { Dossier, Demarche } from "../entities";

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

  static async tryUpsertDossierDS(
    apiDossier: Partial<TDossier>,
    demarcheEntity: Demarche,
  ) {
    const dossierDS = await DossierDS.upsert(
      {
        id: apiDossier.number,
        dataJson: apiDossier,
        dsUpdateAt: apiDossier.dateDerniereModification,
      },
      {
        conflictPaths: ["id"],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    await Dossier.upsertByDossierDS(apiDossier, dossierDS, demarcheEntity);
  }
}
