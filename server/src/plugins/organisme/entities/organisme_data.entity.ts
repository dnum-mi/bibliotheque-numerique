import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { OrganismesSource } from "./organisme_source.entity";

@Entity({ name: "organismes_datas" })
export class OrganismesData extends BaseEntity {
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

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;
}
