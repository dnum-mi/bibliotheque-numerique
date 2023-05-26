import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ApplicationEntity } from "../../../shared/entities/application_entity";
import { Organisme } from "./organisme.entity";
import { Connector } from "../../../modules/connector/connector.entity";

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
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataJson: any;

  @Column({ type: "timestamp" })
  dataUpdateAt: Date;
}
