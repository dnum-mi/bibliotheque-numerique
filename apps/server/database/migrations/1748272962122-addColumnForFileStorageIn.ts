import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnForFileStorageIn1748272962122 implements MigrationInterface {
    name = 'AddColumnForFileStorageIn1748272962122'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."file_storagein_enum" AS ENUM('S3', 'HUB')`);
        await queryRunner.query(`ALTER TABLE "file" ADD "storageIn" "public"."file_storagein_enum" NOT NULL DEFAULT 'S3'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "storageIn"`);
        await queryRunner.query(`DROP TYPE "public"."file_storagein_enum"`);
    }

}
