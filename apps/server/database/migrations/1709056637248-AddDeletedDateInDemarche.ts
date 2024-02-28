import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedDateInDemarche1709056637248 implements MigrationInterface {
    name = 'AddDeletedDateInDemarche1709056637248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" ADD "deletedDate" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "deletedDate"`);
    }

}
