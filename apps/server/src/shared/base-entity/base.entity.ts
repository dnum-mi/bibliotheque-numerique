import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date; // TODO: this should be createdAt (with a 'd')

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date; // TODO: this should be updatedAt (with a 'd')
}
