import { MigrationInterface, QueryRunner } from "typeorm";

export class AddManualResetPasswordFields1758216325936 implements MigrationInterface {
    name = 'AddManualResetPasswordFields1758216325936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "pendingPasswordHash" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "passwordChangeRequested" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "passwordChangeRequestedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordChangeRequestedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordChangeRequested"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "pendingPasswordHash"`);
    }

}
