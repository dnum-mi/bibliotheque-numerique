import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobLog1684839244846 implements MigrationInterface {
  name = "CreateJobLog1684839244846";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."job_log_jobname_enum" AS ENUM('no job name given.', 'ds-data-fetching')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_log_jobstatus_enum" AS ENUM('success', 'failure', 'running')`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_log" ("createAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "overAt" TIMESTAMP, "jobName" "public"."job_log_jobname_enum" NOT NULL DEFAULT 'no job name given.', "jobStatus" "public"."job_log_jobstatus_enum" NOT NULL DEFAULT 'running', "log" character varying, CONSTRAINT "PK_7fae985f584950ab07d2f7a5712" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "job_log"`);
    await queryRunner.query(`DROP TYPE "public"."job_log_jobstatus_enum"`);
    await queryRunner.query(`DROP TYPE "public"."job_log_jobname_enum"`);
  }
}
