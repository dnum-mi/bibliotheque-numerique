import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ApplicationEntity } from "../../../entities/application_entity";
import { Connector } from "../../../entities";
import { Organisme } from "./organisme.entity";

export type TUpsertOrganismeData = Partial<OrganismesData>;

@Entity({ name: "organismes_datas" })
export class OrganismesData extends ApplicationEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => Connector)
  @JoinColumn()
  organismesSource: Connector;

  @ManyToOne(() => Organisme)
  @JoinColumn()
  organisme: Organisme;

  @Column({
    type: "varchar",
    nullable: false,
  })
  idRef: string;

  @Column({ type: "jsonb" })
  dataJson: any;

  @Column({ type: "timestamp" })
  dataUpdateAt: Date;
}
