import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTypeForIdentificationDemarches1694512583965 implements MigrationInterface {
    name = 'AddTypeForIdentificationDemarches1694512583965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "identification"`);
        await queryRunner.query(`CREATE TYPE "public"."demarches_identification_enum" AS ENUM('FE')`);
        await queryRunner.query(`ALTER TABLE "demarches" ADD "identification" "public"."demarches_identification_enum"`);
        await queryRunner.query(`ALTER TABLE "demarches" ALTER COLUMN "lastSynchronisedAt" SET DEFAULT '2022-01-01'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" ALTER COLUMN "lastSynchronisedAt" SET DEFAULT '2022-01-01 00:00:00'`);
        await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "identification"`);
        await queryRunner.query(`DROP TYPE "public"."demarches_identification_enum"`);
        await queryRunner.query(`ALTER TABLE "demarches" ADD "identification" character varying`);
    }

}
