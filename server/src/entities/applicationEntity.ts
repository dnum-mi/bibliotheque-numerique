import { BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";

export class ApplicationEntity extends BaseEntity {
  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt: Date;
}
