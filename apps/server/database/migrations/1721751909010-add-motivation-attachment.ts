import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMotivationAttachment1721751909010 implements MigrationInterface {
    name = 'AddMotivationAttachment1721751909010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."file_sourcelabel_enum" RENAME TO "file_sourcelabel_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."file_sourcelabel_enum" AS ENUM('rnf', 'rna', 'ds-annotation', 'ds-message', 'ds-demandeur', 'ds-attestation', 'ds-champ', 'ds-motivation')`);
        await queryRunner.query(`ALTER TABLE "file" ALTER COLUMN "sourceLabel" TYPE "public"."file_sourcelabel_enum" USING "sourceLabel"::"text"::"public"."file_sourcelabel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."file_sourcelabel_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."file_sourcelabel_enum_old" AS ENUM('rnf', 'rna', 'ds-champ', 'ds-annotation', 'ds-message', 'ds-demandeur', 'ds-attestation')`);
        await queryRunner.query(`ALTER TABLE "file" ALTER COLUMN "sourceLabel" TYPE "public"."file_sourcelabel_enum_old" USING "sourceLabel"::"text"::"public"."file_sourcelabel_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."file_sourcelabel_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."file_sourcelabel_enum_old" RENAME TO "file_sourcelabel_enum"`);
    }

}
