import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamePrimaryKeyDossierDS1670498458557
  implements MigrationInterface
{
  name = "RenamePrimaryKeyDossierDS1670498458557";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const res = await queryRunner.query(
      `SELECT constraint_name FROM information_schema.table_constraints tc WHERE table_name = 'dossiers_ds' AND constraint_type = 'PRIMARY KEY';`,
    );
    if (!res[0]?.constraint_name) throw new Error("Primary key name not found");
    await queryRunner.query(
      `ALTER TABLE dossiers_ds RENAME CONSTRAINT "${res[0].constraint_name}" TO pk_dossier_ds_id`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
