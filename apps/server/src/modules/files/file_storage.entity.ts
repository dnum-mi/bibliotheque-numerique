import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApplicationEntity } from "../../shared/entities/application_entity";

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

  @Column({ type: "varchar" })
  originalName: string;

  @Column({ type: "varchar" })
  checksum: string;

  @Column({ type: "int" })
  byteSize: number;

  @Column({ type: "varchar" })
  mimeType: string;
}
