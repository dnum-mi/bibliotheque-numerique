import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeFieldsNumberValueColumnToNumeric1753196323011 implements MigrationInterface {
    name = 'ChangeFieldsNumberValueColumnToNumeric1753196323011'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE "fields"
          ALTER COLUMN "numberValue" TYPE numeric(22, 2)
          USING "numberValue"::numeric
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE "fields"
          ALTER COLUMN "numberValue" TYPE integer
          USING round("numberValue")
        `);
    }

}
