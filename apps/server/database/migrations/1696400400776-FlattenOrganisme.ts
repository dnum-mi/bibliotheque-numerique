import { MigrationInterface, QueryRunner } from "typeorm";

export class FlattenOrganisme1696400400776 implements MigrationInterface {
    name = 'FlattenOrganisme1696400400776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "emails"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "phoneNumbers"`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "email" character varying`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "phoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "addressLabel" character varying`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "addressPostalCode" character varying`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "addressCityName" character varying`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "addressType" character varying`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "addressStreetAddress" character varying`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "addressStreetNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "addressStreetName" character varying`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "addressDepartmentName" character varying`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "addressDepartmentCode" character varying`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "addressRegionName" character varying`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "addressRegionCode" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "demarches" ALTER COLUMN "lastSynchronisedAt" SET DEFAULT '2022-01-01 00:00:00'`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "addressRegionCode"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "addressRegionName"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "addressDepartmentCode"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "addressDepartmentName"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "addressStreetName"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "addressStreetNumber"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "addressStreetAddress"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "addressType"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "addressCityName"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "addressPostalCode"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "addressLabel"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "organismes" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "phoneNumbers" jsonb`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "emails" jsonb`);
        await queryRunner.query(`ALTER TABLE "organismes" ADD "address" jsonb`);
    }

}
