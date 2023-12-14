import { MigrationInterface, QueryRunner } from "typeorm";

export class EntityRnaRnfUnique1696238212621 implements MigrationInterface {
    name = 'EntityRnaRnfUnique1696238212621'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organismes" ADD CONSTRAINT "UQ_f0fec9df75a1f6f195c950c02d2" UNIQUE ("idRna")`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD CONSTRAINT "UQ_d82b2d7164c096f3133dbe52f5e" UNIQUE ("idRnf")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organismes" DROP CONSTRAINT "UQ_d82b2d7164c096f3133dbe52f5e"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP CONSTRAINT "UQ_f0fec9df75a1f6f195c950c02d2"`);
    }

}
