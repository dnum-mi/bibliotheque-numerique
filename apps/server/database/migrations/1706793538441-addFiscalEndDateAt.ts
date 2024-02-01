import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFiscalEndDateAt1706793538441 implements MigrationInterface {
    name = 'AddFiscalEndDateAt1706793538441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organismes" ADD "fiscalEndDateAt" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "fiscalEndDateAt"`);
    }

}
