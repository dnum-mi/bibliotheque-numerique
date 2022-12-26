import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddDemarchesDsTable1671815603068 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "demarches_ds",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isNullable: false,
            isUnique: true,
            primaryKeyConstraintName: "PK_DEMARCHE_DS_ID",
          },
          {
            name: "dataJson",
            type: "jsonb",
          },
          {
            name: "dsUpdateAt",
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("demarches_ds");
  }
}
