import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  ManyToMany,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { Role } from "./role.entity";

@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    type: "varchar",
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: "varchar",
    nullable: false,
  })
  password: string;

  @ManyToMany(() => Role, (role) => role.users)
  roles: Role[];

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;

  @BeforeInsert() async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
