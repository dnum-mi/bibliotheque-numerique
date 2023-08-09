import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { DossierState } from "@dnum-mi/ds-api-client/dist/@types/types";
import { Demarche } from "../../../demarches/objects/entities/demarche.entity";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../../../shared/base-entity/base.entity";
import { Field } from "./field.entity";
import { Dossier as TDossier } from "@dnum-mi/ds-api-client/dist/@types/generated-types";

@Entity({ name: "dossiers" })
@Unique("UQ_DOSSIER", ["sourceId", "demarche"])
export class Dossier extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ nullable: false })
  demarcheId: number;

  @ManyToOne(() => Demarche, (demarche) => demarche.dossiers)
  @JoinColumn()
  demarche?: Demarche;

  @OneToMany(() => Field, (field) => field.dossier, { cascade: true })
  @JoinColumn()
  fields?: Field[];

  @ApiProperty({ enum: DossierState })
  @Column({ type: "varchar" })
  state: DossierState;

  @Column({ nullable: false })
  sourceId: string;

  @Column({ type: "jsonb" })
  dsDataJson: Partial<TDossier>;
}
