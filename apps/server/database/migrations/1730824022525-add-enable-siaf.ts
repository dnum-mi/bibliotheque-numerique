import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEnableSiaf1730824022525 implements MigrationInterface {
    name = 'AddEnableSiaf1730824022525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fields" DROP COLUMN "numberValueOld"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9b341c900bc06d63de43c8497d"`);
        await queryRunner.query(`ALTER TABLE "fields" DROP COLUMN "numberValue"`);
        await queryRunner.query(`ALTER TABLE "fields" ADD "numberValue" integer`);
        await queryRunner.query(`ALTER TYPE "public"."bn-configurations_keyname_enum" RENAME TO "bn-configurations_keyname_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."bn-configurations_keyname_enum" AS ENUM('FE_EXCEL_IMPORT_SHEET_NAME', 'FE_EXCEL_IMPORT_RANGE', 'FE_AMOUNT_CHAMP_TAG', 'FILE_MAXIMUM_SIZE', 'LAST_ORGANISM_SYNC_AT', 'DDC_FIRST_CONTROL_YEAR', 'DDC_MONTH_BEFORE_MISSING', 'ENABLE_RNF_SIAF', 'ENABLE_SIAF')`);
        await queryRunner.query(`ALTER TABLE "bn-configurations" ALTER COLUMN "keyName" TYPE "public"."bn-configurations_keyname_enum" USING "keyName"::"text"::"public"."bn-configurations_keyname_enum"`);
        await queryRunner.query(`DROP TYPE "public"."bn-configurations_keyname_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_9b341c900bc06d63de43c8497d" ON "fields" ("numberValue") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9b341c900bc06d63de43c8497d"`);
        await queryRunner.query(`CREATE TYPE "public"."bn-configurations_keyname_enum_old" AS ENUM('FE_EXCEL_IMPORT_SHEET_NAME', 'FE_EXCEL_IMPORT_RANGE', 'FE_AMOUNT_CHAMP_TAG', 'FILE_MAXIMUM_SIZE', 'LAST_ORGANISM_SYNC_AT', 'DDC_FIRST_CONTROL_YEAR', 'DDC_MONTH_BEFORE_MISSING', 'ENABLE_RNF_SIAF')`);
        await queryRunner.query(`ALTER TABLE "bn-configurations" ALTER COLUMN "keyName" TYPE "public"."bn-configurations_keyname_enum_old" USING "keyName"::"text"::"public"."bn-configurations_keyname_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."bn-configurations_keyname_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."bn-configurations_keyname_enum_old" RENAME TO "bn-configurations_keyname_enum"`);
        await queryRunner.query(`ALTER TABLE "fields" DROP COLUMN "numberValue"`);
        await queryRunner.query(`ALTER TABLE "fields" ADD "numberValue" bigint`);
        await queryRunner.query(`CREATE INDEX "IDX_9b341c900bc06d63de43c8497d" ON "fields" ("numberValue") `);
        await queryRunner.query(`ALTER TABLE "fields" ADD "numberValueOld" integer`);
    }

}
