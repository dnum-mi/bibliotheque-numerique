import { MigrationInterface, QueryRunner } from "typeorm";

export class Typos1696401048659 implements MigrationInterface {
    name = 'Typos1696401048659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" ALTER COLUMN "lastSynchronisedAt" SET DEFAULT '2022-01-01'`);
        await queryRunner.query(`ALTER TYPE "public"."fields_formatfunctionref_enum" RENAME TO "fields_formatfunctionref_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."fields_formatfunctionref_enum" AS ENUM('country', 'status', 'delay-status', 'remaining-time', 'rnf', 'rna')`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "formatFunctionRef" TYPE "public"."fields_formatfunctionref_enum" USING "formatFunctionRef"::"text"::"public"."fields_formatfunctionref_enum"`);
        await queryRunner.query(`DROP TYPE "public"."fields_formatfunctionref_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."fields_formatfunctionref_enum_old" AS ENUM('country', 'status', 'delay-status', 'remaing-time')`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "formatFunctionRef" TYPE "public"."fields_formatfunctionref_enum_old" USING "formatFunctionRef"::"text"::"public"."fields_formatfunctionref_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."fields_formatfunctionref_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."fields_formatfunctionref_enum_old" RENAME TO "fields_formatfunctionref_enum"`);
        await queryRunner.query(`ALTER TABLE "demarches" ALTER COLUMN "lastSynchronisedAt" SET DEFAULT '2022-01-01 00:00:00'`);
    }

}
