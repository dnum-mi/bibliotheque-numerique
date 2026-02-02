import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddIndexesInFieldsFile1768485876104 implements MigrationInterface {
  name = 'AddIndexesInFieldsFile1768485876104'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_FILE_DOSSIERID" ON "public"."file" ("dossierId") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELDS_DOSSIERID" ON "public"."fields" ("dossierId") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELDS_PARENTID" ON "public"."fields" ("parentId") `,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_FIELDS_PARENTID"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_FIELDS_DOSSIERID"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_FILE_DOSSIERID"`);
  }
}
