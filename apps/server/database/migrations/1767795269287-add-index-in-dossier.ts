import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexInDossier1767795269287 implements MigrationInterface {
    name = 'AddIndexInDossier1767795269287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_SOURCE_ID" ON "dossiers" ("sourceId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_SOURCE_ID"`);
    }

}
