import { MigrationInterface, QueryRunner } from 'typeorm'

export class PersonDefaultArray1712828991146 implements MigrationInterface {
  name = 'PersonDefaultArray1712828991146'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Mise à jour des valeurs null par un tableau vide
    await queryRunner.query(
      `UPDATE "organismes" SET "persons" = '[]' WHERE "persons" IS NULL`,
    )

    await queryRunner.query(
      `ALTER TABLE "organismes" ALTER COLUMN "persons" SET NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "organismes" ALTER COLUMN "persons" SET DEFAULT '[]'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organismes" ALTER COLUMN "persons" DROP DEFAULT`,
    )
    await queryRunner.query(
      `ALTER TABLE "organismes" ALTER COLUMN "persons" DROP NOT NULL`,
    )
  }
}
