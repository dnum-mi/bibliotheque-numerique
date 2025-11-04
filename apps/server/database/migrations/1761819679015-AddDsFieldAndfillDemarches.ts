import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDsFieldAndfillDemarches1761819679015 implements MigrationInterface {
    name = 'AddDsFieldAndfillDemarches1761819679015'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" ADD "dsId" integer`);
        await queryRunner.query(`ALTER TABLE "demarches" ADD "dsCreatedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "demarches" ADD "dsPublishedAt" TIMESTAMP`);

        await queryRunner.query(`
          UPDATE "demarches"
          SET
            "dsId" = ("dsDataJson"->>'number')::integer,
            "dsCreatedAt" = ("dsDataJson"->>'dateCreation')::timestamp,
            "dsPublishedAt" = ("dsDataJson"->>'datePublication')::timestamp
          WHERE "dsDataJson" IS NOT NULL;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "dsPublishedAt"`);
        await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "dsCreatedAt"`);
        await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "dsId"`);
    }

}
