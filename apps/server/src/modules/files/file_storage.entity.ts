import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../shared/base-entity/base.entity";

@Entity({ name: "file_storages" })
export class FileStorage extends BaseEntity {
  @PrimaryGeneratedColumn("uuid", {
    primaryKeyConstraintName: "PK_FILE_STORAGE_ID",
  })
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore TODO: why is this id a string all of a sudden ?
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
