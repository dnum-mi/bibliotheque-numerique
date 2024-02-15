import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConfigurations1707320285330 implements MigrationInterface {
    name = 'CreateConfigurations1707320285330'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."bn-configurations_keyname_enum" AS ENUM('EXCEL_IMPORT_SHEET_NAME', 'EXCEL_IMPORT_RANGE', 'EXCEL_IMPORT_CHAMP_ID', 'EXCEL_IMPORT_AMOUNT_CHAMP_ID')`);
        await queryRunner.query(`CREATE TYPE "public"."bn-configurations_valuetype_enum" AS ENUM('string', 'number', 'boolean', 'json', 'date')`);
        await queryRunner.query(`CREATE TABLE "bn-configurations" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "keyName" "public"."bn-configurations_keyname_enum" NOT NULL, "stringValue" character varying NOT NULL DEFAULT '', "valueType" "public"."bn-configurations_valuetype_enum" NOT NULL DEFAULT 'string', CONSTRAINT "UQ_902f5e4bc09d707196cbfd316e3" UNIQUE ("keyName"), CONSTRAINT "PK_43088e38d85f498a58cf0a3457a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bn-configurations"`);
        await queryRunner.query(`DROP TYPE "public"."bn-configurations_valuetype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."bn-configurations_keyname_enum"`);
    }

}
