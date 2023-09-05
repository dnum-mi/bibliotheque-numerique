import { MigrationInterface, QueryRunner } from "typeorm";

export class CustomFilters1693822874539 implements MigrationInterface {
    name = 'CustomFilters1693822874539'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "custom_filter" ("createAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying NOT NULL DEFAULT 'Tableau personnalisé', "groupByDossier" boolean NOT NULL DEFAULT false, "columns" jsonb NOT NULL DEFAULT '[]', "sorts" jsonb DEFAULT '[]', "filters" jsonb, "userId" integer NOT NULL, CONSTRAINT "UQ_CUSTOM_FILTERS" UNIQUE ("userId", "name"), CONSTRAINT "PK_3a6a50a28939450d77ebedbd2db" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "custom_filter" ADD CONSTRAINT "FK_1f5db5e58832973392a3f6918bf" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_filter" DROP CONSTRAINT "FK_1f5db5e58832973392a3f6918bf"`);
        await queryRunner.query(`DROP TABLE "custom_filter"`);
    }

}
