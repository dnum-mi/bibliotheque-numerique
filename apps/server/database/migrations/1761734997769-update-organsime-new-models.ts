import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrgansimeNewModels1761734997769 implements MigrationInterface {
    name = 'UpdateOrgansimeNewModels1761734997769'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."organismes_type_enum" RENAME TO "organismes_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."organismes_type_enum" AS ENUM('unknown', 'ASSO', 'FDD', 'FE', 'FRUP', 'SCI', 'PART', 'UNI')`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "type" TYPE "public"."organismes_type_enum" USING "type"::"text"::"public"."organismes_type_enum"`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "type" SET DEFAULT 'unknown'`);
        await queryRunner.query(`DROP TYPE "public"."organismes_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."organismes_type_enum_old" AS ENUM('ASSO', 'FDD', 'FE', 'FRUP', 'unknown')`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "type" TYPE "public"."organismes_type_enum_old" USING "type"::"text"::"public"."organismes_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "type" SET DEFAULT 'unknown'`);
        await queryRunner.query(`DROP TYPE "public"."organismes_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."organismes_type_enum_old" RENAME TO "organismes_type_enum"`);
    }
}
