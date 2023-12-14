import { MigrationInterface, QueryRunner } from "typeorm";

export class FixtypeLastSynchronisation1694097230961 implements MigrationInterface {
    name = 'FixtypeLastSynchronisation1694097230961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "lastSynchronisedAt"`);
        await queryRunner.query(`ALTER TABLE "demarches" ADD "lastSynchronisedAt" TIMESTAMP NOT NULL DEFAULT '2022-01-01'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "lastSynchronisedAt"`);
        await queryRunner.query(`ALTER TABLE "demarches" ADD "lastSynchronisedAt" date NOT NULL DEFAULT '2022-01-01'`);
    }

}
