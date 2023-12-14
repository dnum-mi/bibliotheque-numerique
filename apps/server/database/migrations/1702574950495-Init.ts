import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1702574950495 implements MigrationInterface {
    name = 'Init1702574950495'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("createAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "email" character varying NOT NULL, "lastname" character varying NOT NULL DEFAULT '', "firstname" character varying NOT NULL DEFAULT '', "job" character varying, "password" character varying NOT NULL, "validated" boolean NOT NULL DEFAULT false, "role" jsonb NOT NULL DEFAULT '{"label":null,"options":{}}', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "custom_filter" ("createAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying NOT NULL DEFAULT 'Tableau personnalisé', "groupByDossier" boolean NOT NULL DEFAULT false, "columns" jsonb NOT NULL DEFAULT '[]', "sorts" jsonb DEFAULT '[]', "filters" jsonb, "userId" integer NOT NULL, "demarcheId" integer NOT NULL, "totals" jsonb DEFAULT '[]', CONSTRAINT "UQ_CUSTOM_FILTERS" UNIQUE ("userId", "name"), CONSTRAINT "PK_3a6a50a28939450d77ebedbd2db" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."demarches_identification_enum" AS ENUM('FE')`);
        await queryRunner.query(`CREATE TABLE "demarches" ("createAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "state" character varying, "title" character varying NOT NULL, "identification" "public"."demarches_identification_enum", "mappingColumns" jsonb NOT NULL DEFAULT '[]', "lastSynchronisedAt" TIMESTAMP NOT NULL DEFAULT '2022-01-01', "types" jsonb NOT NULL DEFAULT '[]', "dsDataJson" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_ec3401ebf93fa02c326ca3eab3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."fields_fieldsource_enum" AS ENUM('champs', 'annotation', 'fix-field')`);
        await queryRunner.query(`CREATE TYPE "public"."fields_dschamptype_enum" AS ENUM('UnknownChamp', 'AddressChamp', 'CarteChamp', 'CheckboxChamp', 'CiviliteChamp', 'CommuneChamp', 'DateChamp', 'DatetimeChamp', 'DecimalNumberChamp', 'DepartementChamp', 'DossierLinkChamp', 'EpciChamp', 'IntegerNumberChamp', 'LinkedDropDownListChamp', 'MultipleDropDownListChamp', 'PaysChamp', 'PieceJustificativeChamp', 'RegionChamp', 'RepetitionChamp', 'SiretChamp', 'TextChamp', 'TitreIdentiteChamp', 'RnaChamp', 'RnfChamp')`);
        await queryRunner.query(`CREATE TYPE "public"."fields_type_enum" AS ENUM('string', 'number', 'enum', 'date', 'boolean', 'file')`);
        await queryRunner.query(`CREATE TYPE "public"."fields_formatfunctionref_enum" AS ENUM('country', 'status', 'delay-status', 'remaining-time', 'rnf', 'rna', 'file', 'prefecture')`);
        await queryRunner.query(`CREATE TABLE "fields" ("createAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "fieldSource" "public"."fields_fieldsource_enum" NOT NULL DEFAULT 'champs', "dsChampType" "public"."fields_dschamptype_enum" DEFAULT 'UnknownChamp', "type" "public"."fields_type_enum" NOT NULL DEFAULT 'string', "formatFunctionRef" "public"."fields_formatfunctionref_enum", "sourceId" character varying NOT NULL, "stringValue" character varying NOT NULL, "dateValue" TIMESTAMP, "numberValue" integer, "parentId" integer, "parentRowIndex" integer, "label" character varying NOT NULL, "rawJson" jsonb, "dossierId" integer NOT NULL, CONSTRAINT "UQ_FIELD" UNIQUE ("dossierId", "sourceId", "parentRowIndex"), CONSTRAINT "PK_ee7a215c6cd77a59e2cb3b59d41" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e83b959e438a77d95d3465a4e3" ON "fields" ("sourceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3dc571fcc8aad37ba2f8d7cfd1" ON "fields" ("stringValue") `);
        await queryRunner.query(`CREATE INDEX "IDX_92abd9812b25f4520e89da43df" ON "fields" ("dateValue") `);
        await queryRunner.query(`CREATE INDEX "IDX_9b341c900bc06d63de43c8497d" ON "fields" ("numberValue") `);
        await queryRunner.query(`CREATE TYPE "public"."organismes_type_enum" AS ENUM('unknown', 'FDD', 'FE', 'FRUP', 'ARUP', 'CULTE')`);
        await queryRunner.query(`CREATE TABLE "organismes" ("createAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "type" "public"."organismes_type_enum" NOT NULL DEFAULT 'unknown', "title" character varying NOT NULL, "email" character varying, "phoneNumber" character varying, "dateCreation" date NOT NULL, "dateDissolution" date, "idRna" character varying, "rnaJson" jsonb, "idRnf" character varying, "rnfJson" jsonb, "addressLabel" character varying, "addressPostalCode" character varying, "addressCityName" character varying, "addressType" character varying, "addressStreetAddress" character varying, "addressStreetNumber" character varying, "addressStreetName" character varying, "addressDepartmentName" character varying, "addressDepartmentCode" character varying, "addressRegionName" character varying, "addressRegionCode" character varying, CONSTRAINT "UQ_f0fec9df75a1f6f195c950c02d2" UNIQUE ("idRna"), CONSTRAINT "UQ_d82b2d7164c096f3133dbe52f5e" UNIQUE ("idRnf"), CONSTRAINT "PK_e1e1a54561ada4e187e6be610e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."dossiers_prefecture_enum" AS ENUM('D00', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16', 'D17', 'D18', 'D19', 'D20A', 'D20B', 'D21', 'D22', 'D23', 'D24', 'D25', 'D26', 'D27', 'D28', 'D29', 'D30', 'D31', 'D32', 'D33', 'D34', 'D35', 'D36', 'D37', 'D38', 'D39', 'D40', 'D41', 'D42', 'D43', 'D44', 'D45', 'D46', 'D47', 'D48', 'D49', 'D50', 'D51', 'D52', 'D53', 'D54', 'D55', 'D56', 'D57', 'D58', 'D59', 'D60', 'D61', 'D62', 'D63', 'D64', 'D65', 'D66', 'D67', 'D68', 'D69', 'D70', 'D71', 'D72', 'D73', 'D74', 'D75', 'D76', 'D77', 'D78', 'D79', 'D80', 'D81', 'D82', 'D83', 'D84', 'D85', 'D86', 'D87', 'D88', 'D89', 'D90', 'D91', 'D92', 'D93', 'D94', 'D95', 'D971', 'D972', 'D973', 'D974', 'D975', 'D976', 'D986', 'D987', 'D988')`);
        await queryRunner.query(`CREATE TABLE "dossiers" ("createAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "demarcheId" integer NOT NULL, "state" character varying NOT NULL, "sourceId" character varying NOT NULL, "dateDepot" character varying, "dsDataJson" jsonb NOT NULL DEFAULT '{}', "prefecture" "public"."dossiers_prefecture_enum", "organismeId" integer, CONSTRAINT "UQ_DOSSIER" UNIQUE ("sourceId", "demarcheId"), CONSTRAINT "PK_d84a24a9d2c52ec01142de45e42" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "instruction_times" ("createAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "startAt" TIMESTAMP, "stopAt" TIMESTAMP, "endAt" TIMESTAMP, "state" character varying NOT NULL DEFAULT '', "dossierId" integer, CONSTRAINT "REL_9155053675d980c27f8160a441" UNIQUE ("dossierId"), CONSTRAINT "PK_bb108b79eae9fa6bf0781d6bd30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."job_logs_jobname_enum" AS ENUM('no job name given.', 'ds-data-fetching', 'update-organisme')`);
        await queryRunner.query(`CREATE TYPE "public"."job_logs_jobstatus_enum" AS ENUM('success', 'failure', 'running')`);
        await queryRunner.query(`CREATE TABLE "job_logs" ("createAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "overAt" TIMESTAMP, "jobName" "public"."job_logs_jobname_enum" NOT NULL DEFAULT 'no job name given.', "jobStatus" "public"."job_logs_jobstatus_enum" NOT NULL DEFAULT 'running', "log" character varying, CONSTRAINT "PK_58193ed7a13b6627e99dc1c0985" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "file_storages" ("createAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "path" character varying NOT NULL, "originalName" character varying NOT NULL, "checksum" character varying NOT NULL, "byteSize" integer NOT NULL, "mimeType" character varying NOT NULL, CONSTRAINT "PK_FILE_STORAGE_ID" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "custom_filter" ADD CONSTRAINT "FK_1f5db5e58832973392a3f6918bf" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "custom_filter" ADD CONSTRAINT "FK_61d390129e0d953d5fbc294eb49" FOREIGN KEY ("demarcheId") REFERENCES "demarches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fields" ADD CONSTRAINT "FK_20c47f9bda3d993c7ae838c1566" FOREIGN KEY ("parentId") REFERENCES "fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fields" ADD CONSTRAINT "FK_5879469316854c7351c2b43f4ee" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dossiers" ADD CONSTRAINT "FK_b26c655e0a94b6feae787042649" FOREIGN KEY ("demarcheId") REFERENCES "demarches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dossiers" ADD CONSTRAINT "FK_cfc9c34fe8c73da3e6f5d018a79" FOREIGN KEY ("organismeId") REFERENCES "organismes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "instruction_times" ADD CONSTRAINT "FK_9155053675d980c27f8160a4415" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "instruction_times" DROP CONSTRAINT "FK_9155053675d980c27f8160a4415"`);
        await queryRunner.query(`ALTER TABLE "dossiers" DROP CONSTRAINT "FK_cfc9c34fe8c73da3e6f5d018a79"`);
        await queryRunner.query(`ALTER TABLE "dossiers" DROP CONSTRAINT "FK_b26c655e0a94b6feae787042649"`);
        await queryRunner.query(`ALTER TABLE "fields" DROP CONSTRAINT "FK_5879469316854c7351c2b43f4ee"`);
        await queryRunner.query(`ALTER TABLE "fields" DROP CONSTRAINT "FK_20c47f9bda3d993c7ae838c1566"`);
        await queryRunner.query(`ALTER TABLE "custom_filter" DROP CONSTRAINT "FK_61d390129e0d953d5fbc294eb49"`);
        await queryRunner.query(`ALTER TABLE "custom_filter" DROP CONSTRAINT "FK_1f5db5e58832973392a3f6918bf"`);
        await queryRunner.query(`DROP TABLE "file_storages"`);
        await queryRunner.query(`DROP TABLE "job_logs"`);
        await queryRunner.query(`DROP TYPE "public"."job_logs_jobstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."job_logs_jobname_enum"`);
        await queryRunner.query(`DROP TABLE "instruction_times"`);
        await queryRunner.query(`DROP TABLE "dossiers"`);
        await queryRunner.query(`DROP TYPE "public"."dossiers_prefecture_enum"`);
        await queryRunner.query(`DROP TABLE "organismes"`);
        await queryRunner.query(`DROP TYPE "public"."organismes_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9b341c900bc06d63de43c8497d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_92abd9812b25f4520e89da43df"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3dc571fcc8aad37ba2f8d7cfd1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e83b959e438a77d95d3465a4e3"`);
        await queryRunner.query(`DROP TABLE "fields"`);
        await queryRunner.query(`DROP TYPE "public"."fields_formatfunctionref_enum"`);
        await queryRunner.query(`DROP TYPE "public"."fields_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."fields_dschamptype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."fields_fieldsource_enum"`);
        await queryRunner.query(`DROP TABLE "demarches"`);
        await queryRunner.query(`DROP TYPE "public"."demarches_identification_enum"`);
        await queryRunner.query(`DROP TABLE "custom_filter"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
