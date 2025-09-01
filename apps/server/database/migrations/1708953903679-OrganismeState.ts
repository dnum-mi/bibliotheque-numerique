import { MigrationInterface, QueryRunner } from "typeorm";

export class OrganismeState1708953903679 implements MigrationInterface {
    name = 'OrganismeState1708953903679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."organismes_state_enum" AS ENUM('queued', 'uploading', 'uploaded', 'failed')`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "state" "public"."organismes_state_enum" NOT NULL DEFAULT 'queued'`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "title" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "dateCreation" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "dateCreation" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "organismes" ALTER COLUMN "title" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "state"`);
        await queryRunner.query(`DROP TYPE "public"."organismes_state_enum"`);
    }

}
