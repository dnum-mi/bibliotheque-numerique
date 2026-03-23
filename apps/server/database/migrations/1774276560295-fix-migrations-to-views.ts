import { MigrationInterface, QueryRunner } from "typeorm";

export class FixMigrationsToViews1774276560295 implements MigrationInterface {
    name = 'FixMigrationsToViews1774276560295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "views" DROP CONSTRAINT "FK_1f5db5e58832973392a3f6918bf"`);
        await queryRunner.query(`ALTER TABLE "views" DROP CONSTRAINT "FK_61d390129e0d953d5fbc294eb49"`);
        await queryRunner.query(`ALTER SEQUENCE IF EXISTS "custom_filter_id_seq" RENAME TO "views_id_seq"`);
        await queryRunner.query(`ALTER TABLE "views" ADD CONSTRAINT "FK_1a136367d53567a43ba7aae5a7b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "views" ADD CONSTRAINT "FK_e4b6076b56a37dbcaff2e2e8f4d" FOREIGN KEY ("demarcheId") REFERENCES "demarches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "views" DROP CONSTRAINT "FK_e4b6076b56a37dbcaff2e2e8f4d"`);
        await queryRunner.query(`ALTER TABLE "views" DROP CONSTRAINT "FK_1a136367d53567a43ba7aae5a7b"`);
        await queryRunner.query(`ALTER SEQUENCE IF EXISTS "views_id_seq" RENAME TO "custom_filter_id_seq"`);
        await queryRunner.query(`ALTER TABLE "views" ADD CONSTRAINT "FK_61d390129e0d953d5fbc294eb49" FOREIGN KEY ("demarcheId") REFERENCES "demarches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "views" ADD CONSTRAINT "FK_1f5db5e58832973392a3f6918bf" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
