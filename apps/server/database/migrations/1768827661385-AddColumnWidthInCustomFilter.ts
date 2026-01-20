import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddColumnWidthInCustomFilter1768827661385
  implements MigrationInterface
{
  name = 'AddColumnWidthInCustomFilter1768827661385'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "custom_filter"
      ADD "columnWidthById" jsonb DEFAULT '{}'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "custom_filter" DROP COLUMN "columnWidthById"`,
    )
  }
}
