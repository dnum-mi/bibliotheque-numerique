import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ApplicationEntity } from "../../../entities/application_entity";
import { Connector } from "../../../entities";

@Entity({ name: "organismes_datas" })
export class OrganismesData extends ApplicationEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => Connector)
  @JoinColumn()
  organismesSource: Connector;

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
