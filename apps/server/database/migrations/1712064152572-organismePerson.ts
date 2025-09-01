import { MigrationInterface, QueryRunner } from "typeorm";

export class OrganismePerson1712064152572 implements MigrationInterface {
    name = 'OrganismePerson1712064152572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organismes" ADD "persons" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "persons"`);
    }

}
