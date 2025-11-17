import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSourcePathColumnInFile1763159302964 implements MigrationInterface {
    name = 'AddSourcePathColumnInFile1763159302964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" ADD "sourcePath" character varying NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "sourcePath"`);
    }

}
