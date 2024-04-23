import { MigrationInterface, QueryRunner } from "typeorm";

export class NoMoreDateType1712828894878 implements MigrationInterface {
    name = 'NoMoreDateType1712828894878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."fields_type_enum" RENAME TO "fields_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."fields_type_enum" AS ENUM('string', 'number', 'numbers', 'enum', 'date', 'boolean', 'file')`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "type" TYPE "public"."fields_type_enum" USING "type"::"text"::"public"."fields_type_enum"`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "type" SET DEFAULT 'string'`);
        await queryRunner.query(`DROP TYPE "public"."fields_type_enum_old"`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."fields_type_enum_old" AS ENUM('string', 'number', 'enum', 'date', 'boolean', 'file')`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "type" TYPE "public"."fields_type_enum_old" USING "type"::"text"::"public"."fields_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "fields" ALTER COLUMN "type" SET DEFAULT 'string'`);
        await queryRunner.query(`DROP TYPE "public"."fields_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."fields_type_enum_old" RENAME TO "fields_type_enum"`);
    }

}
