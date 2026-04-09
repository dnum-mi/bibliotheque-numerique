import { MigrationInterface, QueryRunner } from "typeorm";

export class FixServiceIntructeur99InFields1775745567966 implements MigrationInterface {
    name = 'FixServiceIntructeur99InFields1775745567966'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        UPDATE fields
        SET "stringValue" = 'D99'
        WHERE "sourceId"='9863ce70-6378-4d7e-aca9-b81fb7b97c10'
        AND "dossierId" in (SELECT
            id
        FROM dossiers
        WHERE "dsDataJson"->'groupeInstructeur'->>'label' LIKE '99 - %')
        AND "stringValue" = ''
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
