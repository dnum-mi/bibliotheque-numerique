import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrganismesData } from "./organisme_data.entity";
import { ApplicationEntity } from "../../../entities/applicationEntity";

@Entity({ name: "organismes_sources" })
export class OrganismesSource extends ApplicationEntity {
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
}
