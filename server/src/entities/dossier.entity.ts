import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  EntityManager,
} from "typeorm";
import { DossierDS, Demarche } from "../entities";
import { ApplicationEntity } from "./application_entity";
import { DossierState } from "@dnum-mi/ds-api-client/dist/@types/types";

export type TUpsertDossier = Partial<
  Omit<Dossier, "dossierDS"> & { dossierDS: number }
>;

@Entity({ name: "dossiers" })
export class Dossier extends ApplicationEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @OneToOne(() => DossierDS)
  @JoinColumn()
  dossierDS: DossierDS;

  @ManyToOne(() => Demarche, (demarche) => demarche.dossiers)
  @JoinColumn()
  demarche: Demarche;

  @Column({ type: "varchar" })
  state: DossierState;

  static findWithFilter(filter: object) {
    return this.find({
      where: {
        ...filter,
      },
      relations: {
        dossierDS: true,
      },
    });
  }

  static upsertDossier(
    toUpsert: TUpsertDossier | TUpsertDossier[],
    transactionalEntityManager: EntityManager,
  ) {
    return transactionalEntityManager.upsert(Dossier, toUpsert as any, {
      conflictPaths: ["dossierDS"],
      skipUpdateIfNoValuesChanged: true,
    });
  }
}
