import { MigrationInterface, QueryRunner } from "typeorm";

export class NoMoreOrganismeAtAll1765979350768 implements MigrationInterface {
    name = 'NoMoreOrganismeAtAll1765979350768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "organismes"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      console.log("Sorry petit developpeur, il n'y a pas de retour en arrière");
    }

}
