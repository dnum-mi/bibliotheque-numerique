import { MigrationInterface, QueryRunner } from "typeorm";

export class Anonymisation1713522823175 implements MigrationInterface {
    name = 'Anonymisation1713522823175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" ADD "nbrMonthAnonymisation" integer`);
        await queryRunner.query(`ALTER TABLE "fields" ADD "anonymisedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "dossiers" ADD "anonymisedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dossiers" DROP COLUMN "anonymisedAt"`);
        await queryRunner.query(`ALTER TABLE "fields" DROP COLUMN "anonymisedAt"`);
        await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "nbrMonthAnonymisation"`);
    }

}
