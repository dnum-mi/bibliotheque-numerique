import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApplicationEntity } from "../../../shared/entities/application_entity";
import { OrganismesData } from "./organisme_data.entity";

@Entity({ name: "organismes" })
export class Organisme extends ApplicationEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    type: "varchar",
    nullable: false,
  })
  idRef: string;

  @OneToMany(
    () => OrganismesData,
    (organismesDatas) => organismesDatas.organisme,
  )
  organismeDatas: OrganismesData[];

  @Column({
    type: "varchar",
    nullable: false,
  })
  title: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  address: string;

  // TODO: issue #272 - Mettre en place un table contact?
  @Column({
    type: "jsonb",
    nullable: true,
  })
  emails: string[];

  @Column({
    type: "jsonb",
    nullable: true,
  })
  phoneNumbers: string[];

  @Column({
    type: "varchar",
    nullable: true,
  })
  zipCode: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  city: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  typeStructure: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  leaderName: string;

  @Column({ type: "date" })
  dateCreation: Date;

  @Column({
    type: "date",
    nullable: true,
  })
  dateDeclaration: Date;

  @Column({
    type: "date",
    nullable: true,
  })
  datePublication: Date;

  @Column({
    type: "date",
    nullable: true,
  })
  dateModification: Date;

  @Column({
    type: "date",
    nullable: true,
  })
  dateDissolution: Date;
}
