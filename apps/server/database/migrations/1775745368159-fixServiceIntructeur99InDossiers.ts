import { MigrationInterface, QueryRunner } from "typeorm";

export class FixServiceIntructeur99InDossiers1775745368159 implements MigrationInterface {
    name = 'FixServiceIntructeur99InDossiers1775745368159'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        UPDATE dossiers
          SET prefecture = 'D99'
          WHERE "dsDataJson"->'groupeInstructeur'->>'label' LIKE '99 - %'
          AND prefecture IS NULL
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
