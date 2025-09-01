import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTableSyncStateOrganisme1751467389595 implements MigrationInterface {
    name = 'AddTableSyncStateOrganisme1751467389595'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sync-states_state_enum" AS ENUM('queued', 'uploading', 'uploaded', 'failed')`);
        await queryRunner.query(`CREATE TABLE "sync-states" ("id" SERIAL NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "state" "public"."sync-states_state_enum" NOT NULL DEFAULT 'queued',
          "lastSynchronisedAt" TIMESTAMP,
          "message" character varying,
          CONSTRAINT "PK_16e492341dd677c5418a972d69d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cfc6b13db81256dd890dddbcb6" ON "sync-states" ("state")`);
        await queryRunner.query(`CREATE INDEX "IDX_16e336bd745f640d7367331969" ON "sync-states" ("lastSynchronisedAt")`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "syncStateId" integer`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD CONSTRAINT "UQ_26ad4d845a8a7bb6e744409f0d8" UNIQUE ("syncStateId")`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD CONSTRAINT "FK_JOIN_SYNC_STAT" FOREIGN KEY ("syncStateId") REFERENCES "sync-states"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organismes" DROP CONSTRAINT "FK_JOIN_SYNC_STAT"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP CONSTRAINT "UQ_26ad4d845a8a7bb6e744409f0d8"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "syncStateId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_16e336bd745f640d7367331969"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cfc6b13db81256dd890dddbcb6"`);
        await queryRunner.query(`DROP TABLE "sync-states"`);
        await queryRunner.query(`DROP TYPE "public"."sync-states_state_enum"`);
    }
}
