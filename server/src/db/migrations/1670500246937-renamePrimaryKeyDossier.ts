import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamePrimaryKeyDossier1670500246937
  implements MigrationInterface
{
  name = "RenamePrimaryKeyDossier1670500246937";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const res = await queryRunner.query(
      `SELECT constraint_name FROM information_schema.table_constraints tc WHERE table_name = 'dossiers' AND constraint_type = 'PRIMARY KEY';`,
    );
    if (!res[0]?.constraint_name) throw new Error("Primary key name not found");
    await queryRunner.query(
      `ALTER TABLE dossiers RENAME CONSTRAINT "${res[0].constraint_name}" TO pk_dossier_id`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
