import { MigrationInterface, QueryRunner } from "typeorm";

export class FieldEnumUpdate1696234591178 implements MigrationInterface {
    name = 'FieldEnumUpdate1696234591178'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" ALTER COLUMN "lastSynchronisedAt" SET DEFAULT '2022-01-01'`);
        await queryRunner.query(`ALTER TYPE "public"."fields_dschamptype_enum" RENAME TO "fields_dschamptype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."fields_dschamptype_enum" AS ENUM('UnknownChamp', 'AddressChamp', 'CarteChamp', 'CheckboxChamp', 'CiviliteChamp', 'CommuneChamp', 'DateChamp', 'DatetimeChamp', 'DecimalNumberChamp', 'DepartementChamp', 'DossierLinkChamp', 'EpciChamp', 'IntegerNumberChamp', 'LinkedDropDownListChamp', 'MultipleDropDownListChamp', 'PaysChamp', 'PieceJustificativeChamp', 'RegionChamp', 'RepetitionChamp', 'SiretChamp', 'TextChamp', 'TitreIdentiteChamp', 'RnaChamp', 'RnfChamp')`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "dsChampType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "dsChampType" TYPE "public"."fields_dschamptype_enum" USING "dsChampType"::"text"::"public"."fields_dschamptype_enum"`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "dsChampType" SET DEFAULT 'UnknownChamp'`);
        await queryRunner.query(`DROP TYPE "public"."fields_dschamptype_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."fields_formatfunctionref_enum" RENAME TO "fields_formatfunctionref_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."fields_formatfunctionref_enum" AS ENUM('country', 'status', 'delay-status', 'remaing-time')`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "formatFunctionRef" TYPE "public"."fields_formatfunctionref_enum" USING "formatFunctionRef"::"text"::"public"."fields_formatfunctionref_enum"`);
        await queryRunner.query(`DROP TYPE "public"."fields_formatfunctionref_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."organismes_type_enum" RENAME TO "organismes_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."organismes_type_enum" AS ENUM('unknown', 'FDD', 'FE', 'FRUP', 'ARUP', 'CULTE')`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "type" TYPE "public"."organismes_type_enum" USING "type"::"text"::"public"."organismes_type_enum"`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "type" SET DEFAULT 'unknown'`);
        await queryRunner.query(`DROP TYPE "public"."organismes_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."organismes_type_enum_old" AS ENUM('unknown', 'FDD', 'FE', 'FRUP', 'ARUP', 'W9')`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "type" TYPE "public"."organismes_type_enum_old" USING "type"::"text"::"public"."organismes_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "type" SET DEFAULT 'unknown'`);
        await queryRunner.query(`DROP TYPE "public"."organismes_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."organismes_type_enum_old" RENAME TO "organismes_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."fields_formatfunctionref_enum_old" AS ENUM('country', 'status')`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "formatFunctionRef" TYPE "public"."fields_formatfunctionref_enum_old" USING "formatFunctionRef"::"text"::"public"."fields_formatfunctionref_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."fields_formatfunctionref_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."fields_formatfunctionref_enum_old" RENAME TO "fields_formatfunctionref_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."fields_dschamptype_enum_old" AS ENUM('UnknownChamp', 'AddressChamp', 'CarteChamp', 'CheckboxChamp', 'CiviliteChamp', 'CommuneChamp', 'DateChamp', 'DatetimeChamp', 'DecimalNumberChamp', 'DepartementChamp', 'DossierLinkChamp', 'EpciChamp', 'IntegerNumberChamp', 'LinkedDropDownListChamp', 'MultipleDropDownListChamp', 'PaysChamp', 'PieceJustificativeChamp', 'RegionChamp', 'RepetitionChamp', 'SiretChamp', 'TextChamp', 'TitreIdentiteChamp')`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "dsChampType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "dsChampType" TYPE "public"."fields_dschamptype_enum_old" USING "dsChampType"::"text"::"public"."fields_dschamptype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "dsChampType" SET DEFAULT 'UnknownChamp'`);
        await queryRunner.query(`DROP TYPE "public"."fields_dschamptype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."fields_dschamptype_enum_old" RENAME TO "fields_dschamptype_enum"`);
        await queryRunner.query(`ALTER TABLE "demarches" ALTER COLUMN "lastSynchronisedAt" SET DEFAULT '2022-01-01 00:00:00'`);
    }

}
