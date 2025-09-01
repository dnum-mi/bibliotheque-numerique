import { MigrationInterface, QueryRunner } from "typeorm";

export class DossierToAnonymize1719332411123 implements MigrationInterface {
    name = 'DossierToAnonymize1719332411123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dossiers" ADD "dateTraitement" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dossiers" DROP COLUMN "dateTraitement"`);
    }

}
