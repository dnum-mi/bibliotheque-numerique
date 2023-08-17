import { MigrationInterface, QueryRunner } from "typeorm";

export class FieldWIthDateAndNumber1692276828450 implements MigrationInterface {
    name = 'FieldWIthDateAndNumber1692276828450'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fields" ADD "dateValue" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "fields" ADD "numberValue" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fields" DROP COLUMN "numberValue"`);
        await queryRunner.query(`ALTER TABLE "fields" DROP COLUMN "dateValue"`);
    }

}
