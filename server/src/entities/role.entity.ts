import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinTable,
  ManyToMany,
  Unique,
} from "typeorm";
import { User } from "./user.entity";
import { ApplicationEntity } from "./application_entity";
import { TPermission } from "../types/Permission.type";

@Entity({ name: "roles" })
@Unique("UK_ROLE_NAME", ["name"])
export class Role extends ApplicationEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "jsonb", default: [] })
  permissions: TPermission[];

  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable({ name: "users_roles" })
  users: User[];

  static insertRole(toUpsert: Partial<Role>) {
    return this.createQueryBuilder()
      .insert()
      .into(Role)
      .values(toUpsert)
      .returning(["id", "name", "description", "permissions"])
      .execute();
  }

  static updateRole(id: number, toUpdate: Partial<Role>) {
    return this.createQueryBuilder()
      .insert()
      .update(Role)
      .set(toUpdate)
      .where("id = :id", { id })
      .returning(["id", "name", "description", "permissions"])
      .execute();
  }
}
