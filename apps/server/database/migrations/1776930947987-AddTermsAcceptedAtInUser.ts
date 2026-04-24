import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTermsAcceptedAtInUser1776930947987 implements MigrationInterface {
    name = 'AddTermsAcceptedAtInUser1776930947987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "termsAcceptedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_USERS_TERMS_ACCEPTED_AT" ON "public"."users" ("termsAcceptedAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_USERS_TERMS_ACCEPTED_AT"`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "termsAcceptedAt"`);
    }

}
