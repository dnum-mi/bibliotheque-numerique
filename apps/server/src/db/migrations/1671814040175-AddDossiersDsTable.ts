import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddDossiersDsTable1671814040175 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "dossiers_ds",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isNullable: false,
            isUnique: true,
            primaryKeyConstraintName: "PK_DOSSIER_DS_ID",
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
    await queryRunner.dropTable("dossiers_ds");
  }
}
