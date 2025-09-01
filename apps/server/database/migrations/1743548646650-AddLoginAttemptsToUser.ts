import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLoginAttemptsToUser1743548646650 implements MigrationInterface {
    name = 'AddLoginAttemptsToUser1743548646650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "loginAttempts" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "loginAttempts"`);
    }
}
