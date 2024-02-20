import { MigrationInterface, QueryRunner } from "typeorm";

export class BnConfigurationUpdate1708510835084 implements MigrationInterface {
    name = 'BnConfigurationUpdate1708510835084'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE "bn-configurations"`);
        await queryRunner.query(`ALTER TYPE "public"."bn-configurations_keyname_enum" RENAME TO "bn-configurations_keyname_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."bn-configurations_keyname_enum" AS ENUM('EXCEL_IMPORT_SHEET_NAME', 'EXCEL_IMPORT_RANGE', 'EXCEL_IMPORT_CHAMP_ID', 'EXCEL_IMPORT_AMOUNT_CHAMP_ID', 'FILE_MAXIMUM_SIZE')`);
        await queryRunner.query(`ALTER TABLE "bn-configurations" ALTER COLUMN "keyName" TYPE "public"."bn-configurations_keyname_enum" USING "keyName"::"text"::"public"."bn-configurations_keyname_enum"`);
        await queryRunner.query(`DROP TYPE "public"."bn-configurations_keyname_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."bn-configurations_keyname_enum_old" AS ENUM('EXCEL_IMPORT_SHEET_NAME', 'EXCEL_IMPORT_RANGE', 'EXCEL_IMPORT_CHAMP_ID', 'EXCEL_IMPORT_AMOUNT_CHAMP_ID')`);
        await queryRunner.query(`ALTER TABLE "bn-configurations" ALTER COLUMN "keyName" TYPE "public"."bn-configurations_keyname_enum_old" USING "keyName"::"text"::"public"."bn-configurations_keyname_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."bn-configurations_keyname_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."bn-configurations_keyname_enum_old" RENAME TO "bn-configurations_keyname_enum"`);
    }

}
