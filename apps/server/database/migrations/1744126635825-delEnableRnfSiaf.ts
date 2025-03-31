import { MigrationInterface, QueryRunner } from "typeorm";

export class DelEnableRnfSiaf1744126635825 implements MigrationInterface {
    name = 'DelEnableRnfSiaf1744126635825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."bn-configurations_keyname_enum" RENAME TO "bn-configurations_keyname_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."bn-configurations_keyname_enum" AS ENUM('FE_EXCEL_IMPORT_SHEET_NAME', 'FE_EXCEL_IMPORT_RANGE', 'FE_AMOUNT_CHAMP_TAG', 'FILE_MAXIMUM_SIZE', 'LAST_ORGANISM_SYNC_AT', 'DDC_FIRST_CONTROL_YEAR', 'DDC_MONTH_BEFORE_MISSING', 'ENABLE_SIAF')`);
        await queryRunner.query(`ALTER TABLE "bn-configurations" ALTER COLUMN "keyName" TYPE "public"."bn-configurations_keyname_enum" USING "keyName"::"text"::"public"."bn-configurations_keyname_enum"`);
        await queryRunner.query(`DROP TYPE "public"."bn-configurations_keyname_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."bn-configurations_keyname_enum_old" AS ENUM('FE_EXCEL_IMPORT_SHEET_NAME', 'FE_EXCEL_IMPORT_RANGE', 'FE_AMOUNT_CHAMP_TAG', 'FILE_MAXIMUM_SIZE', 'LAST_ORGANISM_SYNC_AT', 'DDC_FIRST_CONTROL_YEAR', 'DDC_MONTH_BEFORE_MISSING', 'ENABLE_RNF_SIAF', 'ENABLE_SIAF')`);
        await queryRunner.query(`ALTER TABLE "bn-configurations" ALTER COLUMN "keyName" TYPE "public"."bn-configurations_keyname_enum_old" USING "keyName"::"text"::"public"."bn-configurations_keyname_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."bn-configurations_keyname_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."bn-configurations_keyname_enum_old" RENAME TO "bn-configurations_keyname_enum"`);
    }

}
