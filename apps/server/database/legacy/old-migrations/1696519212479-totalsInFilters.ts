import { MigrationInterface, QueryRunner } from "typeorm";

export class TotalsInFilters1696519212479 implements MigrationInterface {
    name = 'TotalsInFilters1696519212479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_filter" ADD "totals" jsonb DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_filter" DROP COLUMN "totals"`);
    }

}
