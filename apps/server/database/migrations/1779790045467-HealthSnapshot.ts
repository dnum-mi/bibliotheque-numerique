import { MigrationInterface, QueryRunner } from "typeorm";

export class HealthSnapshot1779790045467 implements MigrationInterface {
    name = 'HealthSnapshot1779790045467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE TABLE "health_snapshots" (
                  "id" SERIAL NOT NULL,
                  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                  "isEverythingOk" boolean NOT NULL DEFAULT false,
                  "dependenciesHash" jsonb NOT NULL DEFAULT '{}',
                  "appName" character varying NOT NULL,
                  CONSTRAINT "PK_b7f78a6e483311136e4c445a45b" PRIMARY KEY ("id"))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "health_snapshots"`);
    }

}
