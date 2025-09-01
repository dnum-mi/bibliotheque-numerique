import { MigrationInterface, QueryRunner } from "typeorm";

export class OrganismeCascade1709056691001 implements MigrationInterface {
  name = 'OrganismeCascade1709056691001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_f14e5fb559be3a86618823426b6"`);
    await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_organisme" FOREIGN KEY ("organismeId") REFERENCES "organismes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);

    await queryRunner.query(`ALTER TABLE "dossiers" DROP CONSTRAINT "FK_cfc9c34fe8c73da3e6f5d018a79"`);
    await queryRunner.query(`ALTER TABLE "dossiers" ADD CONSTRAINT "FK_organisme" FOREIGN KEY ("organismeId") REFERENCES "organismes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "dossiers" DROP CONSTRAINT "FK_organisme"`);
    await queryRunner.query(`ALTER TABLE "dossiers" ADD CONSTRAINT "FK_cfc9c34fe8c73da3e6f5d018a79" FOREIGN KEY ("organismeId") REFERENCES "organismes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

    await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_organisme"`);
    await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_f14e5fb559be3a86618823426b6" FOREIGN KEY ("organismeId") REFERENCES "organismes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

}
