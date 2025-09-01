import { MigrationInterface, QueryRunner } from 'typeorm'

export class DossierDepotDate1713771396794 implements MigrationInterface {
  name = 'DossierDepotDate1713771396794'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dossiers" ADD "newDateDepot" TIMESTAMP`,
    )
    await queryRunner.query(
      `UPDATE "dossiers" SET "newDateDepot" = to_timestamp("dateDepot", 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`,
    )
    await queryRunner.query(`ALTER TABLE "dossiers" DROP COLUMN "dateDepot"`)
    await queryRunner.query(
      `ALTER TABLE "dossiers" RENAME COLUMN "newDateDepot" TO "dateDepot"`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dossiers" ADD "oldDateDepot" character varying`,
    )
    await queryRunner.query(
      `UPDATE "dossiers" SET "oldDateDepot" = to_char("dateDepot", 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`,
    )
    await queryRunner.query(`ALTER TABLE "dossiers" DROP COLUMN "dateDepot"`)
    await queryRunner.query(
      `ALTER TABLE "dossiers" RENAME COLUMN "oldDateDepot" TO "dateDepot"`,
    )
  }
}
