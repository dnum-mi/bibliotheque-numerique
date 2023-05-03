import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class AddOrganismeTable1672704027352 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organismes",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "idRef",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "title",
            type: "varchar",
            isNullable: false,
          },

          {
            name: "address",
            type: "varchar",
          },
          {
            name: "zipCode",
            type: "varchar",
          },
          {
            name: "city",
            type: "varchar",
          },
          {
            name: "typeStructure",
            type: "varchar",
          },
          {
            name: "leaderName",
            type: "varchar",
          },
          {
            name: "dateCreation",
            type: "timestamp",
          },
          {
            name: "dateDeclaration",
            type: "timestamp",
          },
          {
            name: "datePublication",
            type: "timestamp",
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
      "organismes",
      new TableIndex({
        name: "IDX_ORGANISME_IDREF",
        columnNames: ["idRef"],
      }),
    );
    await queryRunner.createIndex(
      "organismes",
      new TableIndex({
        name: "IDX_ORGANISME_TITLE",
        columnNames: ["title"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("organismes", "IDX_ORGANISME_IDREF");
    await queryRunner.dropIndex("organismes", "IDX_ORGANISME_TITLE");
    await queryRunner.dropTable("organismes");
  }
}
