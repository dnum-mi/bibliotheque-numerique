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

  @Column()
  address: string;

  @Column()
  zipCode: string;

  @Column()
  city: string;

  @Column()
  typeStructure: string;

  @Column()
  leaderName: string;

  @Column({ type: "timestamp" })
  dateCreation: Date;

  @Column({ type: "timestamp" })
  dateDeclaration: Date;

  @Column({ type: "timestamp" })
  datePublication: Date;

  @Column({ type: "timestamp" })
  dateModification: Date;

  @Column({ type: "timestamp" })
  dateDissolution: Date;
}
