import { MigrationInterface, QueryRunner } from "typeorm";

export class DossierNewFields1696262872193 implements MigrationInterface {
    name = 'DossierNewFields1696262872193'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dossiers" ADD "dateDepot" character varying`);
        await queryRunner.query(`ALTER TABLE "dossiers" ADD "prefecture" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dossiers" DROP COLUMN "prefecture"`);
        await queryRunner.query(`ALTER TABLE "dossiers" DROP COLUMN "dateDepot"`);
    }

}
