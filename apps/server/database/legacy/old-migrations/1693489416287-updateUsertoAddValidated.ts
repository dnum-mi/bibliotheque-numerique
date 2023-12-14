import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateUsertoAddValidated1693489416287 implements MigrationInterface {
    name = 'UpdateUsertoAddValidated1693489416287'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE "users" ADD "validated" boolean NOT NULL DEFAULT false')
      await queryRunner.query('UPDATE "users" set "validated" = true')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE "users" DROP COLUMN "validated"')
    }
}
