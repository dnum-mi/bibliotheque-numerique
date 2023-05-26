import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  EntityManager,
} from "typeorm";
import { ApplicationEntity } from "../../../shared/entities/application_entity";
import { DemarcheDS } from "./demarche_ds.entity";
import { Dossier } from "../../dossiers/entities/dossier.entity";

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
  mappingColumns: [];

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static findById(id: number) {
    return this.findOne({
      where: { id },
      relations: { demarcheDS: true, dossiers: { dossierDS: true } },
    });
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static findByDsId(id: number) {
    return this.findOne({
      where: { demarcheDS: { id } },
      relations: { demarcheDS: true },
    });
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static upsertDemarche(
    toUpsert: TUpsertDemarche | TUpsertDemarche[],
    transactionalEntityManager: EntityManager,
  ) {
    return transactionalEntityManager
      .createQueryBuilder()
      .insert()
      .into(Demarche)
      .values(<never>toUpsert)
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
