import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTermsAcceptedAtInUser1776930947987 implements MigrationInterface {
    name = 'AddTermsAcceptedAtInUser1776930947987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "termsAcceptedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "termsAcceptedAt"`);
    }

}
