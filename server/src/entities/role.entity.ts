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

export enum PermissionName {
  CREATE_ROLE = "CREATE_ROLE",
}

export type TPermission = {
  name: PermissionName;
  write?: boolean;
  delete?: boolean;
};

@Entity({ name: "roles" })
@Unique("UK_ROLE_NAME", ["name"])
export class Role extends ApplicationEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: "jsonb" })
  permissions: TPermission[];

  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable({ name: "users_roles" })
  users: User[];

  static upsertRole(toUpsert: Partial<Role>) {
    return this.createQueryBuilder()
      .insert()
      .into(Role)
      .values(toUpsert)
      .orUpdate(
        ["name", "description", "permissions", "updateAt"],
        "UK_ROLE_NAME",
        {
          skipUpdateIfNoValuesChanged: true,
        },
      )
      .returning(["id", "name", "description", "permissions"])
      .execute();
  }
}
