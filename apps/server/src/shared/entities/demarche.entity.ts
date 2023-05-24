import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  EntityManager,
} from "typeorm";
import { Dossier, DemarcheDS } from "./index";
import { ApplicationEntity } from "./application_entity";

export type TUpsertDemarche = Partial<
  Omit<Demarche, "demarcheDS"> & { demarcheDS: number }
>;

@Entity({ name: "demarches" })
export class Demarche extends ApplicationEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @OneToOne(() => DemarcheDS)
  @JoinColumn({
    name: "idDemarcheDS",
    referencedColumnName: "id",
  })
  demarcheDS: DemarcheDS;

  @OneToMany(() => Dossier, (dossier) => dossier.demarche)
  dossiers: Dossier[];

  @Column()
  state: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  identification: string;

  @Column({ nullable: true })
  typeOrganisme: string;

  @Column({ type: "jsonb", default: "[]" })
  mappingColumns: any[];

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

  static upsertDemarche(
    toUpsert: TUpsertDemarche | TUpsertDemarche[],
    transactionalEntityManager: EntityManager,
  ) {
    return transactionalEntityManager
      .createQueryBuilder()
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
