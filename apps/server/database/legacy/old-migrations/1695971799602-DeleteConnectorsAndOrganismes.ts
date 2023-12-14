import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteConnectorsAndOrganismes1695971799602 implements MigrationInterface {
    name = 'DeleteConnectorsAndOrganismes1695971799602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "organismes_datas"`);
        await queryRunner.query(`DROP TABLE "organismes"`);
        await queryRunner.query(`DROP TABLE "connectors"`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
