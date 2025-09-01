import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedDateInDossier1709199445870 implements MigrationInterface {
    name = 'AddDeletedDateInDossier1709199445870'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dossiers" ADD "deletedDate" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dossiers" DROP COLUMN "deletedDate"`);
    }

}
