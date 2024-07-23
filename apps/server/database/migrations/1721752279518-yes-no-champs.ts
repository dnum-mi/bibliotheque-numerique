import { MigrationInterface, QueryRunner } from "typeorm";

export class YesNoChamps1721752279518 implements MigrationInterface {
    name = 'YesNoChamps1721752279518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."fields_dschamptype_enum" RENAME TO "fields_dschamptype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."fields_dschamptype_enum" AS ENUM('UnknownChamp', 'AddressChamp', 'CarteChamp', 'CheckboxChamp', 'CiviliteChamp', 'CommuneChamp', 'DateChamp', 'DatetimeChamp', 'DecimalNumberChamp', 'DepartementChamp', 'DossierLinkChamp', 'EpciChamp', 'IntegerNumberChamp', 'LinkedDropDownListChamp', 'MultipleDropDownListChamp', 'PaysChamp', 'PieceJustificativeChamp', 'RegionChamp', 'RepetitionChamp', 'SiretChamp', 'TextChamp', 'TitreIdentiteChamp', 'YesNoChamp', 'RnaChamp', 'RnfChamp')`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "dsChampType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "dsChampType" TYPE "public"."fields_dschamptype_enum" USING "dsChampType"::"text"::"public"."fields_dschamptype_enum"`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "dsChampType" SET DEFAULT 'UnknownChamp'`);
        await queryRunner.query(`DROP TYPE "public"."fields_dschamptype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."fields_dschamptype_enum_old" AS ENUM('UnknownChamp', 'AddressChamp', 'CarteChamp', 'CheckboxChamp', 'CiviliteChamp', 'CommuneChamp', 'DateChamp', 'DatetimeChamp', 'DecimalNumberChamp', 'DepartementChamp', 'DossierLinkChamp', 'EpciChamp', 'IntegerNumberChamp', 'LinkedDropDownListChamp', 'MultipleDropDownListChamp', 'PaysChamp', 'PieceJustificativeChamp', 'RegionChamp', 'RepetitionChamp', 'SiretChamp', 'TextChamp', 'TitreIdentiteChamp', 'RnaChamp', 'RnfChamp')`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "dsChampType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "dsChampType" TYPE "public"."fields_dschamptype_enum_old" USING "dsChampType"::"text"::"public"."fields_dschamptype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "dsChampType" SET DEFAULT 'UnknownChamp'`);
        await queryRunner.query(`DROP TYPE "public"."fields_dschamptype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."fields_dschamptype_enum_old" RENAME TO "fields_dschamptype_enum"`);
    }

}
