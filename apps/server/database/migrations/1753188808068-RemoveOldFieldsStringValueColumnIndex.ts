import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOldFieldsStringValueColumnIndex1753188808068 implements MigrationInterface {
    name = 'RemoveOldFieldsStringValueColumnIndex1753188808068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_3dc571fcc8aad37ba2f8d7cfd1"`);
        await queryRunner.query(`CREATE INDEX "IDX_fields_stringValue_prefix" ON "fields" (left("stringValue", 100))`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fields_stringValue_prefix"`);
        await queryRunner.query(`CREATE INDEX "IDX_3dc571fcc8aad37ba2f8d7cfd1" ON fields ("stringValue")`)
    }

}
