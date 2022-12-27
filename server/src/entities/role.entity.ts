import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  JoinTable,
  ManyToMany,
} from "typeorm";
import { User } from "./user.entity";

@Entity({ name: "roles" })
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable({ name: "user_roles" })
  users: User[];

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;

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
