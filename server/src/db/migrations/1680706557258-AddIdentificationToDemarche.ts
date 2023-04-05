import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIdentificationToDemarche1680706557258
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "demarches",
      new TableColumn({
        name: "identification",
        type: "text",
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("demarches", "identification");
  }
}
