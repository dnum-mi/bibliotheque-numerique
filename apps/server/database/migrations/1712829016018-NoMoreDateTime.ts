import { MigrationInterface, QueryRunner } from 'typeorm'

export class NoMoreDateTime1712829016018 implements MigrationInterface {
  name = 'NoMoreDateTime1712829016018'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Création des colonnes temporaires avec le type TIMESTAMP
    await queryRunner.query(
      `ALTER TABLE "organismes" ADD "tempDateCreation" TIMESTAMP`,
    )
    await queryRunner.query(
      `ALTER TABLE "organismes" ADD "tempDateDissolution" TIMESTAMP`,
    )
    await queryRunner.query(
      `ALTER TABLE "organismes" ADD "tempFiscalEndDateAt" TIMESTAMP`,
    )

    // Mise à jour des colonnes temporaires avec les dates originales + heure fixée à 12:00:00
    await queryRunner.query(
      `UPDATE "organismes" SET "tempDateCreation" = "dateCreation"::date + time '12:00:00'`,
    )
    await queryRunner.query(
      `UPDATE "organismes" SET "tempDateDissolution" = "dateDissolution"::date + time '12:00:00'`,
    )
    await queryRunner.query(
      `UPDATE "organismes" SET "tempFiscalEndDateAt" = "fiscalEndDateAt"::date + time '12:00:00'`,
    )

    // Suppression des colonnes originales
    await queryRunner.query(
      `ALTER TABLE "organismes" DROP COLUMN "dateCreation"`,
    )
    await queryRunner.query(
      `ALTER TABLE "organismes" DROP COLUMN "dateDissolution"`,
    )
    await queryRunner.query(
      `ALTER TABLE "organismes" DROP COLUMN "fiscalEndDateAt"`,
    )

    // Renommage des colonnes temporaires pour remplacer les originales
    await queryRunner.query(
      `ALTER TABLE "organismes" RENAME COLUMN "tempDateCreation" TO "dateCreation"`,
    )
    await queryRunner.query(
      `ALTER TABLE "organismes" RENAME COLUMN "tempDateDissolution" TO "dateDissolution"`,
    )
    await queryRunner.query(
      `ALTER TABLE "organismes" RENAME COLUMN "tempFiscalEndDateAt" TO "fiscalEndDateAt"`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Ajout des colonnes originales avec le type 'date'
    await queryRunner.query(
      `ALTER TABLE "organismes" ADD "tempDateCreation" date`,
    )
    await queryRunner.query(
      `ALTER TABLE "organismes" ADD "tempDateDissolution" date`,
    )
    await queryRunner.query(
      `ALTER TABLE "organismes" ADD "tempFiscalEndDateAt" date`,
    )

    // Mise à jour des colonnes temporaires avec seulement la partie date des timestamps
    await queryRunner.query(
      `UPDATE "organismes" SET "tempDateCreation" = "dateCreation"::date`,
    )
    await queryRunner.query(
      `UPDATE "organismes" SET "tempDateDissolution" = "dateDissolution"::date`,
    )
    await queryRunner.query(
      `UPDATE "organismes" SET "tempFiscalEndDateAt" = "fiscalEndDateAt"::date`,
    )

    // Suppression des colonnes TIMESTAMP
    await queryRunner.query(
      `ALTER TABLE "organismes" DROP COLUMN "dateCreation"`,
    )
    await queryRunner.query(
      `ALTER TABLE "organismes" DROP COLUMN "dateDissolution"`,
    )
    await queryRunner.query(
      `ALTER TABLE "organismes" DROP COLUMN "fiscalEndDateAt"`,
    )

    // Renommage des colonnes temporaires pour restaurer les noms originaux
    await queryRunner.query(
      `ALTER TABLE "organismes" RENAME COLUMN "tempDateCreation" TO "dateCreation"`,
    )
    await queryRunner.query(
      `ALTER TABLE "organismes" RENAME COLUMN "tempDateDissolution" TO "dateDissolution"`,
    )
    await queryRunner.query(
      `ALTER TABLE "organismes" RENAME COLUMN "tempFiscalEndDateAt" TO "fiscalEndDateAt"`,
    )
  }
}
