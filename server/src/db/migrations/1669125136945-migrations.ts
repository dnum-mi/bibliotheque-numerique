import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1669125136945 implements MigrationInterface {
  name = "migrations1669125136945";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "demarches" ADD "typeOrganisme" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "demarches" DROP COLUMN "typeOrganisme"`,
    );
  }
}
