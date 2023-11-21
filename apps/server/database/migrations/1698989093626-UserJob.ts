import { MigrationInterface, QueryRunner } from "typeorm";

export class UserJob1698989093626 implements MigrationInterface {
    name = 'UserJob1698989093626'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "job" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "job"`);
    }

}
