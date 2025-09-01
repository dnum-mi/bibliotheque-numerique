import { MigrationInterface, QueryRunner } from "typeorm";

export class FieldCode1710222777024 implements MigrationInterface {
    name = 'FieldCode1710222777024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fields" ADD "code" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fields" DROP COLUMN "code"`);
    }

}
