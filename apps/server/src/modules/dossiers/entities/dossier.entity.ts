import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  EntityManager,
} from "typeorm";
import { ApplicationEntity } from "../../../shared/entities/application_entity";
import {
  DossierState,
  TypeOrganisme,
} from "@dnum-mi/ds-api-client/dist/@types/types";
import { DossierDS } from "./dossier_ds.entity";
import { Demarche } from "../../demarches/entities/demarche.entity";
import { ApiProperty } from "@nestjs/swagger";

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

  @ApiProperty({ enum: DossierState })
  @Column({ type: "varchar" })
  state: DossierState;
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static upsertDossier(
    toUpsert: TUpsertDossier | TUpsertDossier[],
    transactionalEntityManager: EntityManager,
  ) {
    return transactionalEntityManager.upsert(Dossier, <never>toUpsert, {
      conflictPaths: ["dossierDS"],
      skipUpdateIfNoValuesChanged: true,
    });
  }
}
