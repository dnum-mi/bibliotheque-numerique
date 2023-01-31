import { MigrationInterface, QueryRunner, Table, TableUnique } from "typeorm";

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
            primaryKeyConstraintName: "PK_ORGANISMES_SOURCE_ID",
          },
          {
            name: "sourceName",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "method",
            type: "varchar",
            default: "'GET'",
          },
          {
            name: "url",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "params",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "query",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "typeAuth",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "token",
            type: "varchar",
            isNullable: true,
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

    await queryRunner.createUniqueConstraint(
      "organismes_sources",
      new TableUnique({
        name: "UK_ORGANISMES_SOURCE_NAME",
        columnNames: ["sourceName"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint(
      "organismes_sources",
      "UK_ORGANISMES_SOURCE_NAME",
    );
    await queryRunner.dropTable("organismes_sources");
  }
}
