import { MigrationInterface, QueryRunner } from "typeorm";
import { TableColumn } from "typeorm";

export class AddColumnsToFileStorage1676844950735
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "file_storages",
      new TableColumn({
        name: "originalName",
        type: "varchar",
      }),
    );
    await queryRunner.addColumn(
      "file_storages",
      new TableColumn({
        name: "checksum",
        type: "varchar",
      }),
    );
    await queryRunner.addColumn(
      "file_storages",
      new TableColumn({
        name: "byteSize",
        type: "int",
      }),
    );
    await queryRunner.addColumn(
      "file_storages",
      new TableColumn({
        name: "mimeType",
        type: "varchar",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("file_storages", "originalName");
    await queryRunner.dropColumn("file_storages", "checksum");
    await queryRunner.dropColumn("file_storages", "byteSize");
    await queryRunner.dropColumn("file_storages", "mimeType");
  }
}
