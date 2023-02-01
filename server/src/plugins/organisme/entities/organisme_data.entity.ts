import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrganismesSource } from "./organisme_source.entity";
import { ApplicationEntity } from "../../../entities/application_entity";

@Entity({ name: "organismes_datas" })
export class OrganismesData extends ApplicationEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(
    () => OrganismesSource,
    (organismesSource) => organismesSource.organismesDatas,
  )
  @JoinColumn()
  organismesSource: OrganismesSource;

  @Column({
    type: "varchar",
    nullable: false,
  })
  idRef: string;

  @Column({ type: "jsonb" })
  dataJson: JSON;

  @Column({ type: "timestamp" })
  dataUpdateAt: Date;
}
