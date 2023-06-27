import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateJobLog1685458127868 implements MigrationInterface {
  name = "UpdateJobLog1685458127868";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "job_logs",
      "id",
      new TableColumn({
        name: "id",
        type: "int",
        isPrimary: true,
        isGenerated: true,
        isNullable: false,
        isUnique: true,
        generationStrategy: "increment",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "job_logs",
      "id",
      new TableColumn({
        name: "id",
        type: "int",
        isPrimary: true,
        isNullable: false,
        isUnique: true,
        generationStrategy: "increment",
      }),
    );
  }
}
