import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExpieredAtForRefreshToken1742831961821 implements MigrationInterface {
    name = 'AddExpieredAtForRefreshToken1742831961821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "expieredAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "expieredAt"`);
    }

}
