import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateOrganismeTypeEnumReplaceArupCulteByAsso1745849929815
  implements MigrationInterface
{
  name = 'UpdateOrganismeTypeEnumReplaceArupCulteByAsso1745849929815'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE organismes ALTER COLUMN type DROP DEFAULT;
    `)

    await queryRunner.query(`
      ALTER TYPE organismes_type_enum RENAME TO organismes_type_enum_old;
    `)

    await queryRunner.query(`
      CREATE TYPE "public"."organismes_type_enum" AS ENUM('unknown', 'FDD', 'FE', 'FRUP', 'ASSO')
    `)

    await queryRunner.query(`
      ALTER TABLE organismes
      ALTER COLUMN type TYPE organismes_type_enum
      USING CASE
        WHEN type IN ('ARUP', 'CULTE') THEN 'ASSO'::text::organismes_type_enum
        ELSE type::text::organismes_type_enum
      END;
    `)

    await queryRunner.query(`
      ALTER TABLE organismes ALTER COLUMN type SET DEFAULT 'unknown';
    `)

    await queryRunner.query(`
      DROP TYPE organismes_type_enum_old;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE organisme ALTER COLUMN type DROP DEFAULT;
    `)

    await queryRunner.query(`
      CREATE TYPE organismes_type_enum_old AS ENUM ('unknown', 'FDD', 'FE', 'FRUP', 'ARUP', 'CULTE');
    `)

    await queryRunner.query(`
      ALTER TABLE organisme
      ALTER COLUMN type TYPE organismes_type_enum_old
      USING CASE
        WHEN type = 'ASSO' THEN 'CULTE'::text::organismes_type_enum_old
        ELSE type::text::organismes_type_enum_old
      END;
    `)

    await queryRunner.query(`
      ALTER TABLE organisme ALTER COLUMN type SET DEFAULT 'unknown';
    `)

    await queryRunner.query(`
      DROP TYPE organismes_type_enum;
    `)

    await queryRunner.query(`
      ALTER TYPE organismes_type_enum_old RENAME TO organismes_type_enum;
    `)
  }
}
