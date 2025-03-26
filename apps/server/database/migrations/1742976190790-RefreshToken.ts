import { MigrationInterface, QueryRunner } from "typeorm";

export class RefreshToken1742976190790 implements MigrationInterface {
    name = 'RefreshToken1742976190790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("refreshToken" character varying NOT NULL, "connectWithSso" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "UQ_84519890ff1135ab93aba6546f8" UNIQUE ("refreshToken"), CONSTRAINT "REL_610102b60fea1455310ccd299d" UNIQUE ("userId"), CONSTRAINT "PK_84519890ff1135ab93aba6546f8" PRIMARY KEY ("refreshToken"))`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    }

}
