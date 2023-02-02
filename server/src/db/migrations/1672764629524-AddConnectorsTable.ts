import { MigrationInterface, QueryRunner, Table, TableUnique } from "typeorm";

export class AddConnectorsTable1672764629524 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "connectors",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
            primaryKeyConstraintName: "PK_CONNECTOR_ID",
          },
          {
            name: "name",
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
      "connectors",
      new TableUnique({
        name: "UK_CONNECTOR_NAME",
        columnNames: ["name"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint("connectors", "UK_CONNECTOR_NAME");
    await queryRunner.dropTable("connectors");
  }
}
