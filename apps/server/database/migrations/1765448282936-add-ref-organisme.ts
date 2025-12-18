import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefOrganisme1765448282936 implements MigrationInterface {
    name = 'AddRefOrganisme1765448282936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dossiers" ADD "organismeRefs" character varying array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dossiers" DROP COLUMN "organismeRefs"`);
    }

}
