import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { TPermission } from "../../../shared/types/Permission.type";
import { BaseEntity } from "../../../shared/base-entity/base.entity";

@Entity({ name: "roles" })
@Unique("UK_ROLE_NAME", ["name"])
export class Role extends BaseEntity {
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
}
