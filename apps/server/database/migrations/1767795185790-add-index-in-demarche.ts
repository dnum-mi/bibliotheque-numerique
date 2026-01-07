import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexInDemarche1767795185790 implements MigrationInterface {
    name = 'AddIndexInDemarche1767795185790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_DS_ID" ON "demarches" ("dsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_CREATE_AT" ON "demarches" ("dsCreatedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_DS_PUBLISHED_AT" ON "demarches" ("dsPublishedAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_DS_PUBLISHED_AT"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_CREATE_AT"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_DS_ID"`);
    }

}
