import { MigrationInterface, QueryRunner } from "typeorm";

export class UnsetHeaderOfDossiersIntoColumnsOfListeDossiers1774537596342 implements MigrationInterface {
    name = 'UnsetHeaderOfDossiersIntoColumnsOfListeDossiers1774537596342'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
          UPDATE demarches d
          SET "mappingColumns" = (SELECT jsonb_agg(
              CASE
                  WHEN mappingCol->>'isHeader' = 'true'
                  THEN jsonb_set(mappingCol, '{columnLabel}', 'null')
                  ELSE mappingCol
              END
          )
          FROM jsonb_array_elements(d."mappingColumns") as mappingCol
          )
          WHERE d."mappingColumns" @> '[{"isHeader": true}]'
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      // Impossible to rollback
    }

}
