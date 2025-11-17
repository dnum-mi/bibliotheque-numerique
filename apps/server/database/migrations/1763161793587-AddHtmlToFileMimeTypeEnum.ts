import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHtmlToFileMimeTypeEnum1763161793587 implements MigrationInterface {
    name = 'AddHtmlToFileMimeTypeEnum1763161793587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TYPE "public"."file_mimetype_enum"
        ADD VALUE IF NOT EXISTS 'html'
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TYPE "public"."file_mimetype_enum_tmp" AS ENUM('unknown', 'png', 'jpeg', 'jpg', 'pdf', 'xlsx', 'xls', 'doc', 'docx');
      `)
    await queryRunner.query(`
            ALTER TABLE "file" ALTER COLUMN "mimeType" TYPE "public"."file_mimetype_enum_tmp"
            USING "mimeType"::text::"public"."file_mimetype_enum_tmp";
        `)
    await queryRunner.query(`DROP TYPE "public"."file_mimetype_enum";`)
    await queryRunner.query(`
            ALTER TYPE "public"."file_mimetype_enum_tmp" RENAME TO "file_mimetype_enum";
        `)
    }

}
