import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "organismes" })
export class Organisme extends BaseEntity {
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

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;
}
