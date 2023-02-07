import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApplicationEntity } from "./application_entity";

@Entity({ name: "file_storages" })
export class FileStorage extends ApplicationEntity {
  @PrimaryGeneratedColumn("uuid", {
    primaryKeyConstraintName: "PK_FILE_STORAGE_ID",
  })
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  path: string;
}
