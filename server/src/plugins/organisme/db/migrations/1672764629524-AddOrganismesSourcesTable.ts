import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class AddOrganismesSourcesTable1672764629524
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organismes_sources",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "url",
            type: "varchar",
            isNullable: false,
          },

          {
            name: "typeAuth",
            type: "varchar",
          },
          {
            name: "token",
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

    await queryRunner.createIndex(
      "organismes_sources",
      new TableIndex({
        name: "IDX_ORGANISME_SOURCE_NAME",
        columnNames: ["name"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      "organismes_sources",
      "IDX_ORGANISME_SOURCE_NAME",
    );
    await queryRunner.dropTable("organismes_sources");
  }
}
