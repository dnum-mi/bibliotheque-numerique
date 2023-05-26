import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  ManyToMany,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { Role } from "../../roles/entities/role.entity";
import { ApplicationEntity } from "../../../shared/entities/application_entity";

@Entity({ name: "users" })
export class User extends ApplicationEntity {
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
    select: false,
  })
  password: string;

  @ManyToMany(() => Role, (role) => role.users)
  roles: Role[];

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  @BeforeInsert() async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
