import { MigrationInterface, QueryRunner } from "typeorm";

export class File1708699052609 implements MigrationInterface {
    name = 'File1708699052609'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."file_mimetype_enum" AS ENUM('unknown', 'png', 'jpeg', 'jpg', 'pdf', 'xlsx', 'xls', 'doc', 'docx')`);
        await queryRunner.query(`CREATE TYPE "public"."file_state_enum" AS ENUM('queued', 'uploading', 'uploaded', 'failed')`);
        await queryRunner.query(`CREATE TYPE "public"."file_sourcelabel_enum" AS ENUM('rnf', 'rna', 'ds-champ', 'ds-annotation', 'ds-message', 'ds-demandeur', 'ds-attestation')`);
        await queryRunner.query(`CREATE TABLE "file" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying NOT NULL, "originalLabel" character varying NOT NULL, "checksum" character varying NOT NULL, "byteSize" integer NOT NULL, "mimeType" "public"."file_mimetype_enum" NOT NULL DEFAULT 'unknown', "state" "public"."file_state_enum" NOT NULL DEFAULT 'queued', "sourceLabel" "public"."file_sourcelabel_enum" NOT NULL, "sourceStringId" character varying, "tag" character varying, "sourceIndex" integer, "sourceUploadedAt" TIMESTAMP, "dossierId" integer, "organismeId" integer, CONSTRAINT "PK_8002eb274eb44f7dbc571aa52f8" PRIMARY KEY ("id", "uuid"))`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_135d3d60a93e02b918f7fab6584" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_f14e5fb559be3a86618823426b6" FOREIGN KEY ("organismeId") REFERENCES "organismes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_f14e5fb559be3a86618823426b6"`);
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_135d3d60a93e02b918f7fab6584"`);
        await queryRunner.query(`DROP TABLE "file"`);
        await queryRunner.query(`DROP TYPE "public"."file_sourcelabel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."file_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."file_mimetype_enum"`);
    }

}
