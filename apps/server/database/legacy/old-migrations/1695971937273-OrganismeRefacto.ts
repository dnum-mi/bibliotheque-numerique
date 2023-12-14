import { MigrationInterface, QueryRunner } from "typeorm";

export class OrganismeRefacto1695971937273 implements MigrationInterface {
    name = 'OrganismeRefacto1695971937273'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "demarches" RENAME COLUMN "type" TO "types"`);
      await queryRunner.query(`ALTER TYPE "public"."demarches_type_enum" RENAME TO "demarches_types_enum"`);
      await queryRunner.query(`CREATE TYPE "public"."organismes_type_enum" AS ENUM('unknown', 'FDD', 'FE', 'FRUP', 'ARUP', 'W9')`);
      await queryRunner.query(`CREATE TABLE "organismes" ("createAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "type" "public"."organismes_type_enum" NOT NULL DEFAULT 'unknown', "title" character varying NOT NULL, "address" jsonb, "emails" jsonb, "phoneNumbers" jsonb, "dateCreation" date NOT NULL, "dateDissolution" date, "idRna" character varying, "rnaJson" jsonb, "idRnf" character varying, "rnfJson" jsonb, CONSTRAINT "PK_e1e1a54561ada4e187e6be610e4" PRIMARY KEY ("id"))`);
      await queryRunner.query(`ALTER TABLE "dossiers" ADD "organismeId" integer`);
      await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "types"`);
      await queryRunner.query(`ALTER TABLE "demarches" ADD "types" jsonb NOT NULL DEFAULT '[]'`);
      await queryRunner.query(`ALTER TABLE "dossiers" ADD CONSTRAINT "FK_cfc9c34fe8c73da3e6f5d018a79" FOREIGN KEY ("organismeId") REFERENCES "organismes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "dossiers" DROP CONSTRAINT "FK_cfc9c34fe8c73da3e6f5d018a79"`);
      await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "types"`);
      await queryRunner.query(`ALTER TABLE "demarches" ADD "types" "public"."demarches_types_enum" NOT NULL DEFAULT 'unknown'`);
      await queryRunner.query(`ALTER TABLE "dossiers" DROP COLUMN "organismeId"`);
      await queryRunner.query(`DROP TABLE "organismes"`);
      await queryRunner.query(`DROP TYPE "public"."organismes_type_enum"`);
      await queryRunner.query(`ALTER TYPE "public"."demarches_types_enum" RENAME TO "demarches_type_enum"`);
      await queryRunner.query(`ALTER TABLE "demarches" RENAME COLUMN "types" TO "type"`);
    }
}
