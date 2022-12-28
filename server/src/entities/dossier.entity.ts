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
  EntityManager,
} from "typeorm";
import { DossierDS, Demarche } from "../entities";

export type TUpsertDossier = Partial<
  Omit<Dossier, "dossierDS"> & { dossierDS: number }
>;

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
