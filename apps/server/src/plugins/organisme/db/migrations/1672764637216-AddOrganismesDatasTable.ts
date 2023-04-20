import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class AddOrganismesDatasTable1672764637216
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organismes_datas",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "organismesSourceId",
            type: "int",
          },
          {
            name: "idRef",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "dataJson",
            type: "jsonb",
          },

          {
            name: "dataUpdateAt",
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
      "organismes_datas",
      new TableIndex({
        name: "IDX_ORGANISME_DATA_IDREF",
        columnNames: ["idRef"],
      }),
    );

    await queryRunner.createForeignKey(
      "organismes_datas",
      new TableForeignKey({
        columnNames: ["organismesSourceId"],
        name: "FK_ORGANISME_SOURCE_ID",
        referencedColumnNames: ["id"],
        referencedTableName: "connectors",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("organismes_datas");

    const foreignKeyOrganismesSourceId = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("organismesSourceId") !== -1,
    );
    await queryRunner.dropForeignKey(
      "organismes_datas",
      foreignKeyOrganismesSourceId,
    );
    await queryRunner.dropColumn("organismes_datas", "organismesSourceId");

    await queryRunner.dropIndex("organismes_datas", "IDX_ORGANISME_DATA_IDREF");
    await queryRunner.dropTable("organismes_datas");
  }
}
