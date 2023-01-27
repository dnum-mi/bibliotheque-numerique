import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinTable,
  ManyToMany,
  Unique,
} from "typeorm";
import { User } from "./user.entity";
import { ApplicationEntity } from "./applicationEntity";

@Entity({ name: "roles" })
@Unique("UK_ROLE_NAME", ["name"])
export class Role extends ApplicationEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable({ name: "users_roles" })
  users: User[];

  static upsertRole(toUpsert: Partial<Role>) {
    return this.createQueryBuilder()
      .insert()
      .into(Role)
      .values(toUpsert)
      .orUpdate(["name", "description", "updateAt"], "UK_ROLE_NAME", {
        skipUpdateIfNoValuesChanged: true,
      })
      .returning(["id", "name", "description"])
      .execute();
  }
}
