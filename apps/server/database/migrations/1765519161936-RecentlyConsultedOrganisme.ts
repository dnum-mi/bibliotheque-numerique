import { MigrationInterface, QueryRunner } from 'typeorm'

export class RecentlyConsultedOrganisme1765519161936
  implements MigrationInterface
{
  name = 'RecentlyConsultedOrganisme1765519161936'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users"
      ADD "recentOrganismes" jsonb NOT NULL DEFAULT '[]'::jsonb`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "recentOrganismes"`,
    )
  }
}
