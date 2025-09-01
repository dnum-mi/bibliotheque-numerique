import { MigrationInterface, QueryRunner } from "typeorm";

export class ConfigurationAnonymisation1718717774800 implements MigrationInterface {
    name = 'ConfigurationAnonymisation1718717774800'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`CREATE TYPE "public"."demarches_anonymizationevent_enum" AS ENUM('DepotDate', 'DecisionDate', 'AcceptedDate')`);
      await queryRunner.query(`ALTER TABLE "demarches" ADD "anonymizationEvent" "public"."demarches_anonymizationevent_enum"`);
      await queryRunner.query(`ALTER TABLE "demarches" ADD "isOnAllDossiersOfOrganisme" boolean`);
  }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "isOnAllDossiersOfOrganisme"`);
        await queryRunner.query(`ALTER TABLE "demarches" DROP COLUMN "anonymizationEvent"`);
        await queryRunner.query(`DROP TYPE "public"."demarches_anonymizationevent_enum"`);
    }

}
