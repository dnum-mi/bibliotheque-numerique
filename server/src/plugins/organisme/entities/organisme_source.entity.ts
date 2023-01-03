import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { OrganismesData } from "./organisme_data.entity";

@Entity({ name: "organismes_sources" })
export class OrganismesSource extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @OneToMany(
    () => OrganismesData,
    (organismesDatas) => organismesDatas.organismesSource,
  )
  organismesDatas: OrganismesData[];

  @Column({
    type: "varchar",
    nullable: false,
  })
  name: string;

  @Column({
    type: "varchar",
    nullable: false,
  })
  url: string;

  @Column()
  typeAuth: string;

  @Column()
  token: string;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;
}
