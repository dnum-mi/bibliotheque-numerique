import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DossierState } from "@dnum-mi/ds-api-client/dist/@types/types";
import { DossierDS } from "./dossier_ds.entity";
import { Demarche } from "../../../demarches/entities/demarche.entity";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../../../shared/base-entity/base.entity";
import { Field } from "./field.entity";

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

  @OneToMany(() => Field, (field) => field.dossier)
  @JoinColumn()
  fields: Field[];

  @ApiProperty({ enum: DossierState })
  @Column({ type: "varchar" })
  state: DossierState;
}
