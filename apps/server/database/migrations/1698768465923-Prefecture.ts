import { MigrationInterface, QueryRunner } from 'typeorm'

export class Prefecture1698768465923 implements MigrationInterface {
  name = 'Prefecture1698768465923'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "dossiers" DROP COLUMN "prefecture"`)
    await queryRunner.query(
      `CREATE TYPE "public"."dossiers_prefecture_enum" AS ENUM('D00', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16', 'D17', 'D18', 'D19', 'D20A', 'D20B', 'D21', 'D22', 'D23', 'D24', 'D25', 'D26', 'D27', 'D28', 'D29', 'D30', 'D31', 'D32', 'D33', 'D34', 'D35', 'D36', 'D37', 'D38', 'D39', 'D40', 'D41', 'D42', 'D43', 'D44', 'D45', 'D46', 'D47', 'D48', 'D49', 'D50', 'D51', 'D52', 'D53', 'D54', 'D55', 'D56', 'D57', 'D58', 'D59', 'D60', 'D61', 'D62', 'D63', 'D64', 'D65', 'D66', 'D67', 'D68', 'D69', 'D70', 'D71', 'D72', 'D73', 'D74', 'D75', 'D76', 'D77', 'D78', 'D79', 'D80', 'D81', 'D82', 'D83', 'D84', 'D85', 'D86', 'D87', 'D88', 'D89', 'D90', 'D91', 'D92', 'D93', 'D94', 'D95', 'D971', 'D972', 'D973', 'D974', 'D975', 'D976', 'D986', 'D987', 'D988')`,
    )
    await queryRunner.query(
      `ALTER TABLE "dossiers" ADD "prefecture" "public"."dossiers_prefecture_enum"`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "dossiers" DROP COLUMN "prefecture"`)
    await queryRunner.query(`DROP TYPE "public"."dossiers_prefecture_enum"`)
    await queryRunner.query(
      `ALTER TABLE "dossiers" ADD "prefecture" character varying`,
    )
  }
}
