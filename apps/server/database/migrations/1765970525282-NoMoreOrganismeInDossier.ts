import { MigrationInterface, QueryRunner } from "typeorm";

export class NoMoreOrganismeInDossier1765970525282 implements MigrationInterface {
    name = 'NoMoreOrganismeInDossier1765970525282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "dossiers" d
                SET "organismeRefs" = ARRAY[COALESCE(o."idRna", o."idRnf")]
                FROM "organismes" o
                WHERE d."organismeId" = o."id"
                    AND d."organismeRefs" IS NULL
                    AND (o."idRna" IS NOT NULL OR o."idRnf" IS NOT NULL);
        `)
        await queryRunner.query(`ALTER TABLE "dossiers" DROP CONSTRAINT "FK_organisme"`);
        await queryRunner.query(`ALTER TABLE "dossiers" DROP COLUMN "organismeId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      console.log("Sorry petit developpeur, il n'y a pas de retour en arrière")
    }

}
