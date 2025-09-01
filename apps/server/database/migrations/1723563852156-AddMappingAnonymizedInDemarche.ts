import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMappingAnonymizedInDemarche1723563852156 implements MigrationInterface {
    name = 'AddMappingAnonymizedInDemarche1723563852156'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" ADD "mappingAnonymized" jsonb NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "mappingAnonymized"`);
    }

}
