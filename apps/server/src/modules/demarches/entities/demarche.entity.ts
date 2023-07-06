import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { DemarcheDS } from "./demarche_ds.entity";
import { Dossier } from "../../dossiers/entities/dossier.entity";
import { BaseEntity } from "../../../shared/base-entity/base.entity";

export type TUpsertDemarche = Partial<
  Omit<Demarche, "demarcheDS"> & { demarcheDS: number }
>;

@Entity({ name: "demarches" })
export class Demarche extends BaseEntity {
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
}
