import { MigrationInterface, QueryRunner } from 'typeorm'

export class Field1689742747429 implements MigrationInterface {
  name = 'Field1689742747429'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"public\".\"fields_fieldsource_enum\" AS ENUM('champs', 'annotation', 'dossier')",
    )
    await queryRunner.query(
      "CREATE TYPE \"public\".\"fields_dschamptype_enum\" AS ENUM('UnknownChamp', 'AddressChamp', 'CarteChamp', 'CheckboxChamp', 'CiviliteChamp', 'CommuneChamp', 'DateChamp', 'DatetimeChamp', 'DecimalNumberChamp', 'DepartementChamp', 'DossierLinkChamp', 'EpciChamp', 'IntegerNumberChamp', 'LinkedDropDownListChamp', 'MultipleDropDownListChamp', 'PaysChamp', 'PieceJustificativeChamp', 'RegionChamp', 'RepetitionChamp', 'SiretChamp', 'TextChamp', 'TitreIdentiteChamp')",
    )
    await queryRunner.query(
      "CREATE TYPE \"public\".\"fields_type_enum\" AS ENUM('string', 'number', 'date', 'boolean')",
    )
    await queryRunner.query("CREATE TYPE \"public\".\"fields_formatfunctionref_enum\" AS ENUM('country', 'status')")
    await queryRunner.query(
      'CREATE TABLE "fields" ("createAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "fieldSource" "public"."fields_fieldsource_enum" NOT NULL DEFAULT \'champs\', "dsChampType" "public"."fields_dschamptype_enum" DEFAULT \'UnknownChamp\', "type" "public"."fields_type_enum" NOT NULL DEFAULT \'string\', "formatFunctionRef" "public"."fields_formatfunctionref_enum", "dsFieldId" character varying, "stringValue" character varying NOT NULL, "parentId" integer, "parentRowIndex" integer, "label" character varying NOT NULL, "rawJson" jsonb, "dossierId" integer NOT NULL, CONSTRAINT "PK_ee7a215c6cd77a59e2cb3b59d41" PRIMARY KEY ("id"))',
    )
    await queryRunner.query(
      'ALTER TABLE "fields" ADD CONSTRAINT "FK_20c47f9bda3d993c7ae838c1566" FOREIGN KEY ("parentId") REFERENCES "fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE "fields" ADD CONSTRAINT "FK_5879469316854c7351c2b43f4ee" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE "fields" ADD CONSTRAINT "UQ_30409f91c45a64aa504a0bd288f" UNIQUE ("dossierId", "dsFieldId", "parentRowIndex")',
    )
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "fields" DROP CONSTRAINT "UQ_30409f91c45a64aa504a0bd288f"')
    await queryRunner.query('ALTER TABLE "fields" DROP CONSTRAINT "FK_5879469316854c7351c2b43f4ee"')
    await queryRunner.query('ALTER TABLE "fields" DROP CONSTRAINT "FK_20c47f9bda3d993c7ae838c1566"')
    await queryRunner.query('DROP TABLE "fields"')
    await queryRunner.query('DROP TYPE "public"."fields_formatfunctionref_enum"')
    await queryRunner.query('DROP TYPE "public"."fields_type_enum"')
    await queryRunner.query('DROP TYPE "public"."fields_dschamptype_enum"')
    await queryRunner.query('DROP TYPE "public"."fields_fieldsource_enum"')
  }
}
