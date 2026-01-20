import { MigrationInterface, QueryRunner } from "typeorm";

export class UniformisationOfView1768831457489 implements MigrationInterface {
    name = 'UniformisationOfView1768831457489'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "custom_filter" RENAME TO "views"`);
      await queryRunner.query(`ALTER INDEX "UQ_CUSTOM_FILTERS" RENAME TO "UQ_VIEWS"`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER INDEX "UQ_VIEWS" RENAME TO "UQ_CUSTOM_FILTER"`);
      await queryRunner.query(`ALTER TABLE "views" RENAME TO "custom_filters"`);
    }

}
