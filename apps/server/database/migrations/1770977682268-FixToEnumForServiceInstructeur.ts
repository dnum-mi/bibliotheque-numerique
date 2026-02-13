import { MigrationInterface, QueryRunner } from "typeorm";

export class FixToEnumForServiceInstructeur1770977682268 implements MigrationInterface {
    name = 'FixToEnumForServiceInstructeur1770977682268'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        UPDATE demarches d
        SET "mappingColumns" = (
            SELECT jsonb_agg(
                CASE
                    WHEN mappingCol->>'id' = '9863ce70-6378-4d7e-aca9-b81fb7b97c10'
                    THEN jsonb_set(mappingCol, '{type}', '"enum"')
                    ELSE mappingCol
                END
            )
            FROM jsonb_array_elements(d."mappingColumns" ) as mappingCol
        )
        WHERE d."mappingColumns" @> '[{"id": "9863ce70-6378-4d7e-aca9-b81fb7b97c10"}]'
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        UPDATE demarches d
        SET "mappingColumns" = (
            SELECT jsonb_agg(
                CASE
                    WHEN mappingCol->>'id' = '9863ce70-6378-4d7e-aca9-b81fb7b97c10'
                    THEN jsonb_set(mappingCol, '{type}', '"string"')
                    ELSE mappingCol
                END
            )
            FROM jsonb_array_elements(d."mappingColumns" ) as mappingCol
        )
        WHERE d."mappingColumns" @> '[{"id": "9863ce70-6378-4d7e-aca9-b81fb7b97c10"}]'
      `)
    }

}
