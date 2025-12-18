import { MigrationInterface, QueryRunner } from "typeorm";

export class NoMoreOrganismeInFile1765970655983 implements MigrationInterface {
  name = "NoMoreOrganismeInFile1765970655983";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Ajouter la colonne cible
    await queryRunner.query(`
      ALTER TABLE "file" ADD COLUMN "organismeRef" character varying;
    `);

    // 2) Migrer la donnée (ne touche pas si déjà rempli)
    await queryRunner.query(`
      UPDATE "file" f
      SET "organismeRef" = COALESCE(o."idRna", o."idRnf")
        FROM "organismes" o
      WHERE f."organismeId" = o."id"
        AND (o."idRna" IS NOT NULL OR o."idRnf" IS NOT NULL);
    `);

    // 3) Nettoyage
    await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_organisme"`);
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "organismeId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log("Sorry petit developpeur, il n'y a pas de retour en arrière");
  }
}
