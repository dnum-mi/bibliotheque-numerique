import { MigrationInterface, QueryRunner } from 'typeorm'

export class FixingRole1700640670776 implements MigrationInterface {
  name = 'FixingRole1700640670776'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`)
    await queryRunner.query(
      `ALTER TABLE "users" ADD "role" jsonb NOT NULL DEFAULT '{"label":null,"options":{}}'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT '{"label": null, "options": []}'`,
    )
  }}
