import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTermsAcceptedAtInUser1776930947987 implements MigrationInterface {
    name = 'AddTermsAcceptedAtInUser1776930947987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "termsAcceptedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE INDEX "IDX_41104b624e61778f7767449db0" ON "users" ("termsAcceptedAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_41104b624e61778f7767449db0"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "termsAcceptedAt"`);
    }

}
