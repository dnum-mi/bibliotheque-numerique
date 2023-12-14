import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileInFieldsFormatFunctionrefEnum1698053622454 implements MigrationInterface {
    name = 'AddFileInFieldsFormatFunctionrefEnum1698053622454'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."fields_formatfunctionref_enum" RENAME TO "fields_formatfunctionref_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."fields_formatfunctionref_enum" AS ENUM('country', 'status', 'delay-status', 'remaining-time', 'rnf', 'rna', 'file')`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "formatFunctionRef" TYPE "public"."fields_formatfunctionref_enum" USING "formatFunctionRef"::"text"::"public"."fields_formatfunctionref_enum"`);
        await queryRunner.query(`DROP TYPE "public"."fields_formatfunctionref_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."fields_formatfunctionref_enum_old" AS ENUM('country', 'status', 'delay-status', 'remaining-time', 'rnf', 'rna')`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "formatFunctionRef" TYPE "public"."fields_formatfunctionref_enum_old" USING "formatFunctionRef"::"text"::"public"."fields_formatfunctionref_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."fields_formatfunctionref_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."fields_formatfunctionref_enum_old" RENAME TO "fields_formatfunctionref_enum"`);
    }

}
