import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMaarchValueOnFileSourceLabelEnum1769499471474
  implements MigrationInterface
{
  name = 'AddMaarchValueOnFileSourceLabelEnum1769499471474'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."file_sourcelabel_enum" ADD VALUE IF NOT EXISTS 'maarch'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."file_sourcelabel_enum_tmp" AS ENUM('rnf', 'rna', 'ds-annotation', 'ds-message', 'ds-demandeur', 'ds-attestation', 'ds-champ', 'ds-motivation')`,
    )
    await queryRunner.query(
      `ALTER TABLE "file" ALTER COLUMN "sourceLabel" TYPE "public"."file_sourcelabel_enum_tmp" USING "sourceLabel"::"text"::"public"."file_sourcelabel_enum_tmp"`,
    )
    await queryRunner.query(`DROP TYPE "public"."file_sourcelabel_enum"`)
    await queryRunner.query(
      `ALTER TYPE "public"."file_sourcelabel_enum_tmp" RENAME TO "file_sourcelabel_enum"`,
    )
  }
}
