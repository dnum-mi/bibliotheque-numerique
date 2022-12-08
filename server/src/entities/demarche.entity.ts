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

export type TUpsertDemarche = Partial<
  Omit<Demarche, "demarcheDS"> & { demarcheDS: number }
>;

@Entity({ name: "demarches" })
export class Demarche extends BaseEntity {
  @PrimaryGeneratedColumn("increment", {
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

  static findById(id: number) {
    return this.findOne({
      where: { id },
      relations: { demarcheDS: true, dossiers: { dossierDS: true } },
    });
  }

  static findByDsId(id: number) {
    return this.findOne({
      where: { demarcheDS: { id } },
      relations: { demarcheDS: true },
    });
  }

  static findWithFilter(filter: object) {
    return this.find({
      where: {
        ...filter,
      },
      relations: {
        demarcheDS: true,
      },
    });
  }

  static upsertDemarche(toUpsert: TUpsertDemarche | TUpsertDemarche[]) {
    return this.createQueryBuilder()
      .insert()
      .into(Demarche)
      .values(toUpsert as any)
      .orUpdate(
        ["title", "state", "typeOrganisme", "updateAt"],
        ["idDemarcheDS"],
        {
          skipUpdateIfNoValuesChanged: true,
        },
      )
      .execute();
  }
}
