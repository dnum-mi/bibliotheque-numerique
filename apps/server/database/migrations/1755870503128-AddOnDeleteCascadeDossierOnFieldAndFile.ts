import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOnDeleteCascadeDossierOnFieldAndFile1755870503128 implements MigrationInterface {
    name = 'AddOnDeleteCascadeDossierOnFieldAndFile1755870503128'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fields" DROP CONSTRAINT "FK_5879469316854c7351c2b43f4ee"`);
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_135d3d60a93e02b918f7fab6584"`);
        await queryRunner.query(`ALTER TABLE "fields" ADD CONSTRAINT "FK_5879469316854c7351c2b43f4ee" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_135d3d60a93e02b918f7fab6584" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_135d3d60a93e02b918f7fab6584"`);
        await queryRunner.query(`ALTER TABLE "fields" DROP CONSTRAINT "FK_5879469316854c7351c2b43f4ee"`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_135d3d60a93e02b918f7fab6584" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fields" ADD CONSTRAINT "FK_5879469316854c7351c2b43f4ee" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
