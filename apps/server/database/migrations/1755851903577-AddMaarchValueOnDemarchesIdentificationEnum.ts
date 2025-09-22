import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMaarchValueOnDemarchesIdentificationEnum1755851903577
  implements MigrationInterface
{
  name = 'AddMaarchValueOnDemarchesIdentificationEnum1755851903577'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TYPE "public"."demarches_identification_enum"
        ADD VALUE IF NOT EXISTS 'MAARCH'
      `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE "public"."demarches_identification_enum_tmp" AS ENUM('FE', 'DDC');
      `)
    await queryRunner.query(`
            ALTER TABLE "demarches" ALTER COLUMN "identification" TYPE "public"."demarches_identification_enum_tmp"
            USING "identification"::text::"public"."demarches_identification_enum_tmp";
        `)
    await queryRunner.query(`DROP TYPE "public"."demarches_identification_enum";`)
    await queryRunner.query(`
            ALTER TYPE "public"."demarches_identification_enum_tmp" RENAME TO "demarches_identification_enum";
        `)
  }
}
