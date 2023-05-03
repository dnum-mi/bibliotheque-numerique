import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddFileStorageTable1675734586674 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "file_storages",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
            isUnique: true,
            default: "uuid_generate_v4()",
            primaryKeyConstraintName: "PK_FILE_STORAGE_ID",
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "path",
            type: "varchar",
          },
          {
            name: "createAt",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updateAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("file_storages");
  }
}
