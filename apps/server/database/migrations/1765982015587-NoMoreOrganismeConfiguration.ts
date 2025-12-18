import { MigrationInterface, QueryRunner } from "typeorm";

export class NoMoreOrganismeConfiguration1765982015587 implements MigrationInterface {
  name = 'NoMoreOrganismeConfiguration1765982015587'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "isOnAllDossiersOfOrganisme"`);

    // 1) Nettoyer les lignes qui ne seront plus valides dans le nouvel enum
    await queryRunner.query(`
      DELETE FROM "bn-configurations"
      WHERE "keyName" NOT IN (
          'FE_EXCEL_IMPORT_SHEET_NAME',
          'FE_EXCEL_IMPORT_RANGE',
          'FE_AMOUNT_CHAMP_TAG',
          'FILE_MAXIMUM_SIZE'
        );
    `);

    // 2) Swap enum
    await queryRunner.query(`ALTER TYPE "public"."bn-configurations_keyname_enum" RENAME TO "bn-configurations_keyname_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."bn-configurations_keyname_enum" AS ENUM('FE_EXCEL_IMPORT_SHEET_NAME', 'FE_EXCEL_IMPORT_RANGE', 'FE_AMOUNT_CHAMP_TAG', 'FILE_MAXIMUM_SIZE')`);
    await queryRunner.query(`
      ALTER TABLE "bn-configurations"
      ALTER COLUMN "keyName"
      TYPE "public"."bn-configurations_keyname_enum"
      USING "keyName"::text::"public"."bn-configurations_keyname_enum"
    `);
    await queryRunner.query(`DROP TYPE "public"."bn-configurations_keyname_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."bn-configurations_keyname_enum_old" AS ENUM('FE_EXCEL_IMPORT_SHEET_NAME', 'FE_EXCEL_IMPORT_RANGE', 'FE_AMOUNT_CHAMP_TAG', 'FILE_MAXIMUM_SIZE', 'LAST_ORGANISM_SYNC_AT', 'LAST_FOUNDATION_SYNC_AT', 'DDC_FIRST_CONTROL_YEAR', 'DDC_MONTH_BEFORE_MISSING', 'ENABLE_HUB_SEARCH', 'SYNC_RNA_VIA_HUB')`);
    await queryRunner.query(`ALTER TABLE "bn-configurations" ALTER COLUMN "keyName" TYPE "public"."bn-configurations_keyname_enum_old" USING "keyName"::text::"public"."bn-configurations_keyname_enum_old"`);
    await queryRunner.query(`DROP TYPE "public"."bn-configurations_keyname_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."bn-configurations_keyname_enum_old" RENAME TO "bn-configurations_keyname_enum"`);
    await queryRunner.query(`ALTER TABLE "demarches" ADD "isOnAllDossiersOfOrganisme" boolean`);
  }
}
