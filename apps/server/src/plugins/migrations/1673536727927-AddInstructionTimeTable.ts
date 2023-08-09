import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class AddInstructionTimeTable1673536727927
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "instruction_times",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "dossierId",
            type: "int",
          },

          {
            name: "startAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "stopAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "endAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "state",
            type: "varchar",
            isNullable: false,
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

    await queryRunner.createForeignKey(
      "instruction_times",
      new TableForeignKey({
        columnNames: ["dossierId"],
        name: "FK_DOSSIER_ID",
        referencedColumnNames: ["id"],
        referencedTableName: "dossiers",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("instruction_times");

    const foreignKeyDossierId = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("dossierId") !== -1,
    );
    await queryRunner.dropForeignKey("instruction_times", foreignKeyDossierId);
    await queryRunner.dropColumn("instruction_times", "dossierId");
    await queryRunner.dropTable("instruction_times");
  }
}
