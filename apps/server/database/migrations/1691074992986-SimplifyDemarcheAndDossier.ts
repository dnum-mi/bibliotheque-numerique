import { MigrationInterface, QueryRunner, Table } from 'typeorm'

/*
  This is the first time we let typeorm generate the migration file.
  This file garanties that the database schema is in sync with the code.
  From now on, migration:generate should not generate anymore migration code
  that is not a direct consequence from changing entities.
  Developer should not generate migration manually so error can be avoided.
 */
export class SimplifyDemarcheAndDossier1691074992986 implements MigrationInterface {
  name = 'SimplifyDemarcheAndDossier1691074992986'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "demarches" DROP CONSTRAINT "FK_DEMARCHE_DS_ID"')
    await queryRunner.query('ALTER TABLE "dossiers" DROP CONSTRAINT "FK_DOSSIER_DS_ID"')
    await queryRunner.query('DROP TABLE "dossiers_ds" CASCADE')
    await queryRunner.query('DROP TABLE "demarches_ds" CASCADE')

    await queryRunner.query('ALTER TABLE "organismes_datas" DROP CONSTRAINT "FK_ORGANISME_SOURCE_ID"')
    await queryRunner.query('ALTER TABLE "organismes_datas" DROP CONSTRAINT "FK_ORGANISMES_DATAS_ORGANISMES"')
    await queryRunner.query('ALTER TABLE "dossiers" DROP CONSTRAINT "FK_DEMARCHE_ID"')
    await queryRunner.query('ALTER TABLE "instruction_times" DROP CONSTRAINT "FK_DOSSIER_ID"')
    await queryRunner.query('ALTER TABLE "users_roles" DROP CONSTRAINT "FK_USER_ID"')
    await queryRunner.query('ALTER TABLE "users_roles" DROP CONSTRAINT "FK_ROLE_ID"')
    await queryRunner.query('DROP INDEX "public"."IDX_USER_EMAIL"')
    await queryRunner.query('DROP INDEX "public"."IDX_ORGANISME_DATA_IDREF"')
    await queryRunner.query('DROP INDEX "public"."IDX_ORGANISME_IDREF"')
    await queryRunner.query('DROP INDEX "public"."IDX_ORGANISME_TITLE"')
    await queryRunner.query('DROP INDEX "public"."IDX_USERS_ROLES_USERS"')
    await queryRunner.query('DROP INDEX "public"."IDX_USERS_ROLES_ROLES"')
    await queryRunner.query('ALTER TABLE "fields" DROP CONSTRAINT "UQ_30409f91c45a64aa504a0bd288f"')
    await queryRunner.query('ALTER TABLE "demarches" DROP CONSTRAINT "UQ_26cf3f8ffd8cb4ab69662ae7e34"')
    await queryRunner.query('ALTER TABLE "demarches" DROP COLUMN "idDemarcheDS"')
    await queryRunner.query('ALTER TABLE "demarches" DROP COLUMN "typeOrganisme"')
    await queryRunner.query('ALTER TABLE "dossiers" DROP CONSTRAINT "UQ_86e38f82e5123a2e0180b643eda"')
    await queryRunner.query('ALTER TABLE "dossiers" DROP COLUMN "dossierDSId"')
    await queryRunner.query('ALTER TABLE "users_roles" DROP COLUMN "createAt"')
    await queryRunner.query(
      'ALTER TABLE "demarches" ADD "lastSynchronisedAt" date NOT NULL DEFAULT \'2022-01-01T00:00:00.000Z\'',
    )
    await queryRunner.query(
      "CREATE TYPE \"public\".\"demarches_type_enum\" AS ENUM('unknown', 'FDD', 'FE', 'ARUP', 'FRUP', 'W9')",
    )
    await queryRunner.query(
      'ALTER TABLE "demarches" ADD "type" "public"."demarches_type_enum" NOT NULL DEFAULT \'unknown\'',
    )
    await queryRunner.query('ALTER TABLE "demarches" ADD "dsDataJson" jsonb NOT NULL')
    await queryRunner.query('ALTER TABLE "dossiers" ADD "sourceId" character varying NOT NULL')
    await queryRunner.query('ALTER TABLE "dossiers" ADD "dsDataJson" jsonb NOT NULL')
    await queryRunner.query('ALTER TABLE "connectors" ALTER COLUMN "params" SET NOT NULL')
    await queryRunner.query('ALTER TABLE "connectors" ALTER COLUMN "query" SET NOT NULL')
    await queryRunner.query('ALTER TABLE "connectors" ALTER COLUMN "typeAuth" SET NOT NULL')
    await queryRunner.query('ALTER TABLE "connectors" ALTER COLUMN "token" SET NOT NULL')
    await queryRunner.query('ALTER TABLE "job_logs" DROP CONSTRAINT "UQ_58193ed7a13b6627e99dc1c0985"')
    await queryRunner.query('ALTER TYPE "public"."job_logs_jobname_enum" RENAME TO "job_logs_jobname_enum_old"')
    await queryRunner.query(
      "CREATE TYPE \"public\".\"job_logs_jobname_enum\" AS ENUM('no job name given.', 'ds-data-fetching', 'update-organisme')",
    )
    await queryRunner.query('ALTER TABLE "job_logs" ALTER COLUMN "jobName" DROP DEFAULT')
    await queryRunner.query(
      'ALTER TABLE "job_logs" ALTER COLUMN "jobName" TYPE "public"."job_logs_jobname_enum" USING "jobName"::"text"::"public"."job_logs_jobname_enum"',
    )
    await queryRunner.query('ALTER TABLE "job_logs" ALTER COLUMN "jobName" SET DEFAULT \'no job name given.\'')
    await queryRunner.query('DROP TYPE "public"."job_logs_jobname_enum_old"')
    await queryRunner.query('ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")')
    await queryRunner.query('ALTER TABLE "organismes_datas" ALTER COLUMN "organismesSourceId" DROP NOT NULL')
    await queryRunner.query('ALTER TABLE "demarches" ALTER COLUMN "state" DROP NOT NULL')
    await queryRunner.query('ALTER TABLE "demarches" DROP COLUMN "identification"')
    await queryRunner.query('ALTER TABLE "demarches" ADD "identification" character varying')
    await queryRunner.query('ALTER TYPE "public"."fields_type_enum" RENAME TO "fields_type_enum_old"')
    await queryRunner.query(
      "CREATE TYPE \"public\".\"fields_type_enum\" AS ENUM('string', 'number', 'date', 'boolean', 'file')",
    )
    await queryRunner.query('ALTER TABLE "fields" ALTER COLUMN "type" DROP DEFAULT')
    await queryRunner.query(
      'ALTER TABLE "fields" ALTER COLUMN "type" TYPE "public"."fields_type_enum" USING "type"::"text"::"public"."fields_type_enum"',
    )
    await queryRunner.query('ALTER TABLE "fields" ALTER COLUMN "type" SET DEFAULT \'string\'')
    await queryRunner.query('DROP TYPE "public"."fields_type_enum_old"')
    await queryRunner.query('ALTER TABLE "dossiers" ALTER COLUMN "demarcheId" SET NOT NULL')
    await queryRunner.query('ALTER TABLE "instruction_times" ALTER COLUMN "state" SET DEFAULT \'\'')
    await queryRunner.query('ALTER TABLE "instruction_times" ALTER COLUMN "dossierId" DROP NOT NULL')
    await queryRunner.query(
      'ALTER TABLE "instruction_times" ADD CONSTRAINT "UQ_9155053675d980c27f8160a4415" UNIQUE ("dossierId")',
    )
    await queryRunner.query('CREATE INDEX "IDX_21db462422f1f97519a29041da" ON "users_roles" ("rolesId") ')
    await queryRunner.query('CREATE INDEX "IDX_deeb1fe94ce2d111a6695a2880" ON "users_roles" ("usersId") ')
    await queryRunner.query(
      'ALTER TABLE "fields" ADD CONSTRAINT "UQ_FIELD" UNIQUE ("dossierId", "dsFieldId", "parentRowIndex")',
    )
    await queryRunner.query('ALTER TABLE "dossiers" ADD CONSTRAINT "UQ_DOSSIER" UNIQUE ("sourceId", "demarcheId")')
    await queryRunner.query(
      'ALTER TABLE "organismes_datas" ADD CONSTRAINT "FK_23dec9cd0c803348e748be8923c" FOREIGN KEY ("organismesSourceId") REFERENCES "connectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE "organismes_datas" ADD CONSTRAINT "FK_6f50cb4f6b633236c334435a607" FOREIGN KEY ("organismeId") REFERENCES "organismes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE "dossiers" ADD CONSTRAINT "FK_b26c655e0a94b6feae787042649" FOREIGN KEY ("demarcheId") REFERENCES "demarches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE "instruction_times" ADD CONSTRAINT "FK_9155053675d980c27f8160a4415" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE "users_roles" ADD CONSTRAINT "FK_21db462422f1f97519a29041da0" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE',
    )
    await queryRunner.query(
      'ALTER TABLE "users_roles" ADD CONSTRAINT "FK_deeb1fe94ce2d111a6695a2880e" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    )
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "users_roles" DROP CONSTRAINT "FK_deeb1fe94ce2d111a6695a2880e"')
    await queryRunner.query('ALTER TABLE "users_roles" DROP CONSTRAINT "FK_21db462422f1f97519a29041da0"')
    await queryRunner.query('ALTER TABLE "instruction_times" DROP CONSTRAINT "FK_9155053675d980c27f8160a4415"')
    await queryRunner.query('ALTER TABLE "dossiers" DROP CONSTRAINT "FK_b26c655e0a94b6feae787042649"')
    await queryRunner.query('ALTER TABLE "organismes_datas" DROP CONSTRAINT "FK_6f50cb4f6b633236c334435a607"')
    await queryRunner.query('ALTER TABLE "organismes_datas" DROP CONSTRAINT "FK_23dec9cd0c803348e748be8923c"')
    await queryRunner.query('ALTER TABLE "dossiers" DROP CONSTRAINT "UQ_DOSSIER"')
    await queryRunner.query('ALTER TABLE "fields" DROP CONSTRAINT "UQ_FIELD"')
    await queryRunner.query('DROP INDEX "public"."IDX_deeb1fe94ce2d111a6695a2880"')
    await queryRunner.query('DROP INDEX "public"."IDX_21db462422f1f97519a29041da"')
    await queryRunner.query('ALTER TABLE "instruction_times" DROP CONSTRAINT "UQ_9155053675d980c27f8160a4415"')
    await queryRunner.query('ALTER TABLE "instruction_times" ALTER COLUMN "dossierId" SET NOT NULL')
    await queryRunner.query('ALTER TABLE "instruction_times" ALTER COLUMN "state" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "dossiers" ALTER COLUMN "demarcheId" DROP NOT NULL')
    await queryRunner.query(
      "CREATE TYPE \"public\".\"fields_type_enum_old\" AS ENUM('string', 'number', 'date', 'boolean')",
    )
    await queryRunner.query('ALTER TABLE "fields" ALTER COLUMN "type" DROP DEFAULT')
    await queryRunner.query(
      'ALTER TABLE "fields" ALTER COLUMN "type" TYPE "public"."fields_type_enum_old" USING "type"::"text"::"public"."fields_type_enum_old"',
    )
    await queryRunner.query('ALTER TABLE "fields" ALTER COLUMN "type" SET DEFAULT \'string\'')
    await queryRunner.query('DROP TYPE "public"."fields_type_enum"')
    await queryRunner.query('ALTER TYPE "public"."fields_type_enum_old" RENAME TO "fields_type_enum"')
    await queryRunner.query('ALTER TABLE "demarches" DROP COLUMN "identification"')
    await queryRunner.query('ALTER TABLE "demarches" ADD "identification" text')
    await queryRunner.query('ALTER TABLE "demarches" ALTER COLUMN "state" SET NOT NULL')
    await queryRunner.query('ALTER TABLE "organismes_datas" ALTER COLUMN "organismesSourceId" SET NOT NULL')
    await queryRunner.query('ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"')
    await queryRunner.query(
      "CREATE TYPE \"public\".\"job_logs_jobname_enum_old\" AS ENUM('no job name given.', 'ds-data-fetching')",
    )
    await queryRunner.query('ALTER TABLE "job_logs" ALTER COLUMN "jobName" DROP DEFAULT')
    await queryRunner.query(
      'ALTER TABLE "job_logs" ALTER COLUMN "jobName" TYPE "public"."job_logs_jobname_enum_old" USING "jobName"::"text"::"public"."job_logs_jobname_enum_old"',
    )
    await queryRunner.query('ALTER TABLE "job_logs" ALTER COLUMN "jobName" SET DEFAULT \'no job name given.\'')
    await queryRunner.query('DROP TYPE "public"."job_logs_jobname_enum"')
    await queryRunner.query('ALTER TYPE "public"."job_logs_jobname_enum_old" RENAME TO "job_logs_jobname_enum"')
    await queryRunner.query('ALTER TABLE "job_logs" ADD CONSTRAINT "UQ_58193ed7a13b6627e99dc1c0985" UNIQUE ("id")')
    await queryRunner.query('ALTER TABLE "connectors" ALTER COLUMN "token" DROP NOT NULL')
    await queryRunner.query('ALTER TABLE "connectors" ALTER COLUMN "typeAuth" DROP NOT NULL')
    await queryRunner.query('ALTER TABLE "connectors" ALTER COLUMN "query" DROP NOT NULL')
    await queryRunner.query('ALTER TABLE "connectors" ALTER COLUMN "params" DROP NOT NULL')
    await queryRunner.query('ALTER TABLE "dossiers" DROP COLUMN "dsDataJson"')
    await queryRunner.query('ALTER TABLE "dossiers" DROP COLUMN "sourceId"')
    await queryRunner.query('ALTER TABLE "demarches" DROP COLUMN "dsDataJson"')
    await queryRunner.query('ALTER TABLE "demarches" DROP COLUMN "type"')
    await queryRunner.query('DROP TYPE "public"."demarches_type_enum"')
    await queryRunner.query('ALTER TABLE "demarches" DROP COLUMN "lastSynchronisedAt"')
    await queryRunner.query('ALTER TABLE "users_roles" ADD "createAt" TIMESTAMP NOT NULL DEFAULT now()')
    await queryRunner.query('ALTER TABLE "dossiers" ADD "dossierDSId" integer')
    await queryRunner.query(
      'ALTER TABLE "dossiers" ADD CONSTRAINT "UQ_86e38f82e5123a2e0180b643eda" UNIQUE ("dossierDSId")',
    )
    await queryRunner.query('ALTER TABLE "demarches" ADD "typeOrganisme" character varying')
    await queryRunner.query('ALTER TABLE "demarches" ADD "idDemarcheDS" integer')
    await queryRunner.query(
      'ALTER TABLE "demarches" ADD CONSTRAINT "UQ_26cf3f8ffd8cb4ab69662ae7e34" UNIQUE ("idDemarcheDS")',
    )
    await queryRunner.query(
      'ALTER TABLE "fields" ADD CONSTRAINT "UQ_30409f91c45a64aa504a0bd288f" UNIQUE ("dsFieldId", "parentRowIndex", "dossierId")',
    )
    await queryRunner.query('CREATE INDEX "IDX_USERS_ROLES_ROLES" ON "users_roles" ("rolesId") ')
    await queryRunner.query('CREATE INDEX "IDX_USERS_ROLES_USERS" ON "users_roles" ("usersId") ')
    await queryRunner.query('CREATE INDEX "IDX_ORGANISME_TITLE" ON "organismes" ("title") ')
    await queryRunner.query('CREATE INDEX "IDX_ORGANISME_IDREF" ON "organismes" ("idRef") ')
    await queryRunner.query('CREATE INDEX "IDX_ORGANISME_DATA_IDREF" ON "organismes_datas" ("idRef") ')
    await queryRunner.query('CREATE INDEX "IDX_USER_EMAIL" ON "users" ("email") ')
    await queryRunner.query(
      'ALTER TABLE "users_roles" ADD CONSTRAINT "FK_ROLE_ID" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE "users_roles" ADD CONSTRAINT "FK_USER_ID" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE "instruction_times" ADD CONSTRAINT "FK_DOSSIER_ID" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE "dossiers" ADD CONSTRAINT "FK_DEMARCHE_ID" FOREIGN KEY ("demarcheId") REFERENCES "demarches"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE "organismes_datas" ADD CONSTRAINT "FK_ORGANISMES_DATAS_ORGANISMES" FOREIGN KEY ("organismeId") REFERENCES "organismes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE "organismes_datas" ADD CONSTRAINT "FK_ORGANISME_SOURCE_ID" FOREIGN KEY ("organismesSourceId") REFERENCES "connectors"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    )
    await queryRunner.createTable(
      new Table({
        name: 'demarches_ds',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isNullable: false,
            isUnique: true,
            primaryKeyConstraintName: 'PK_DEMARCHE_DS_ID',
          },
          {
            name: 'dataJson',
            type: 'jsonb',
          },
          {
            name: 'dsUpdateAt',
            type: 'timestamp',
          },
          {
            name: 'createAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updateAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    )
    await queryRunner.createTable(
      new Table({
        name: 'dossiers_ds',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isNullable: false,
            isUnique: true,
            primaryKeyConstraintName: 'PK_DOSSIER_DS_ID',
          },
          {
            name: 'dataJson',
            type: 'jsonb',
          },
          {
            name: 'dsUpdateAt',
            type: 'timestamp',
          },
          {
            name: 'createAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updateAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    )
    await queryRunner.query(
      'ALTER TABLE "dossiers" ADD CONSTRAINT "FK_DOSSIER_DS_ID" FOREIGN KEY ("dossierDSId") REFERENCES "dossiers_ds"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE "demarches" ADD CONSTRAINT "FK_DEMARCHE_DS_ID" FOREIGN KEY ("idDemarcheDS") REFERENCES "demarches_ds"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    )
  }
}
