import { MigrationInterface, QueryRunner } from "typeorm";

export class FieldIndexes1692521927194 implements MigrationInterface {
    name = 'FieldIndexes1692521927194'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fields" RENAME COLUMN "dsFieldId" TO "sourceId"`);
        await queryRunner.query(`ALTER TYPE "public"."fields_fieldsource_enum" RENAME TO "fields_fieldsource_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."fields_fieldsource_enum" AS ENUM('champs', 'annotation', 'fix-field')`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "fieldSource" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "fieldSource" TYPE "public"."fields_fieldsource_enum" USING "fieldSource"::"text"::"public"."fields_fieldsource_enum"`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "fieldSource" SET DEFAULT 'champs'`);
        await queryRunner.query(`DROP TYPE "public"."fields_fieldsource_enum_old"`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "sourceId" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_e83b959e438a77d95d3465a4e3" ON "fields" ("sourceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3dc571fcc8aad37ba2f8d7cfd1" ON "fields" ("stringValue") `);
        await queryRunner.query(`CREATE INDEX "IDX_92abd9812b25f4520e89da43df" ON "fields" ("dateValue") `);
        await queryRunner.query(`CREATE INDEX "IDX_9b341c900bc06d63de43c8497d" ON "fields" ("numberValue") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9b341c900bc06d63de43c8497d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_92abd9812b25f4520e89da43df"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3dc571fcc8aad37ba2f8d7cfd1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e83b959e438a77d95d3465a4e3"`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "sourceId" DROP NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."fields_fieldsource_enum_old" AS ENUM('champs', 'annotation', 'dossier')`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "fieldSource" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "fieldSource" TYPE "public"."fields_fieldsource_enum_old" USING "fieldSource"::"text"::"public"."fields_fieldsource_enum_old"`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "fieldSource" SET DEFAULT 'champs'`);
        await queryRunner.query(`DROP TYPE "public"."fields_fieldsource_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."fields_fieldsource_enum_old" RENAME TO "fields_fieldsource_enum"`);
        await queryRunner.query(`ALTER TABLE "fields" RENAME COLUMN "sourceId" TO "dsFieldId"`);
    }

}
