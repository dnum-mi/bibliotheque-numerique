import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVariableConfigForSyncHub1751894220903 implements MigrationInterface {
    name = 'AddVariableConfigForSyncHub1751894220903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."bn-configurations_keyname_enum" RENAME TO "bn-configurations_keyname_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."bn-configurations_keyname_enum" AS ENUM(
          'FE_EXCEL_IMPORT_SHEET_NAME',
          'FE_EXCEL_IMPORT_RANGE',
          'FE_AMOUNT_CHAMP_TAG',
          'FILE_MAXIMUM_SIZE',
          'LAST_ORGANISM_SYNC_AT',
          'LAST_FOUNDATION_SYNC_AT',
          'DDC_FIRST_CONTROL_YEAR',
          'DDC_MONTH_BEFORE_MISSING',
          'ENABLE_HUB_SEARCH',
          'SYNC_RNA_VIA_HUB',
          'SYNC_RNF_VIA_HUB')`);
        await queryRunner.query(`ALTER TABLE "bn-configurations"
          ALTER COLUMN "keyName" TYPE "public"."bn-configurations_keyname_enum"
          USING CASE
          WHEN "keyName" = 'ENABLE_SIAF' THEN 'ENABLE_HUB_SEARCH'::"text"::"public"."bn-configurations_keyname_enum"
          ELSE "keyName"::"text"::"public"."bn-configurations_keyname_enum"
          END`);
        await queryRunner.query(`DROP TYPE "public"."bn-configurations_keyname_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "bn-configurations" WHERE "keyName" IN (
          'LAST_FOUNDATION_SYNC_AT',
          'SYNC_RNA_VIA_HUB',
          'SYNC_RNF_VIA_HUB'
          )`);
        await queryRunner.query(`CREATE TYPE "public"."bn-configurations_keyname_enum_old" AS ENUM(
          'DDC_FIRST_CONTROL_YEAR',
          'DDC_MONTH_BEFORE_MISSING',
          'ENABLE_SIAF',
          'FE_AMOUNT_CHAMP_TAG',
          'FE_EXCEL_IMPORT_RANGE',
          'FE_EXCEL_IMPORT_SHEET_NAME',
          'FILE_MAXIMUM_SIZE',
          'LAST_ORGANISM_SYNC_AT')`);
        await queryRunner.query(`ALTER TABLE "bn-configurations"
          ALTER COLUMN "keyName" TYPE "public"."bn-configurations_keyname_enum_old"
          USING CASE
            WHEN "keyName" = 'ENABLE_HUB_SEARCH' THEN 'ENABLE_SIAF'::"text"::"public"."bn-configurations_keyname_enum_old"
            ELSE "keyName"::"text"::"public"."bn-configurations_keyname_enum_old"
          END
          `);
        await queryRunner.query(`DROP TYPE "public"."bn-configurations_keyname_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."bn-configurations_keyname_enum_old" RENAME TO "bn-configurations_keyname_enum"`);
    }

}
