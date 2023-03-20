import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApplicationEntity } from "../../../entities/application_entity";

@Entity({ name: "organismes" })
export class Organisme extends ApplicationEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    type: "varchar",
    nullable: false,
  })
  idRef: string;

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

  @Column({ type: "timestamp" })
  dateCreation: Date;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  dateDeclaration: Date;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  datePublication: Date;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  dateModification: Date;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  dateDissolution: Date;
}
