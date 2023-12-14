import { MigrationInterface, QueryRunner } from 'typeorm'

export class FiltreByDemarche1695818395112 implements MigrationInterface {
    name = 'FiltreByDemarche1695818395112'

    public async up(queryRunner: QueryRunner): Promise<void> {

      const filtersFound:{columns: string[], id:number }[] = await queryRunner.query('select columns, id from "custom_filter"')
      const demarchesFound:{columns: string[], id:number }[] = await queryRunner.query(`select id, array_agg(columns) as columns from (select id,  (jsonb_array_elements("mappingColumns")->>'id') as columns
      from demarches) t GROUP BY id`)
      await queryRunner.query('ALTER TABLE "custom_filter" ADD "demarcheId" integer')

      await Promise.all(filtersFound.map(async filter => {
        const demarcheId = demarchesFound.find(demarche => filter.columns.every(col => demarche.columns.includes(col)))?.id
        if(demarcheId) {
          return await queryRunner.query('UPDATE "custom_filter" SET "demarcheId"=$1 where id=$2', [demarcheId, filter.id])
        }
      }))
      await queryRunner.query('ALTER TABLE "custom_filter" ALTER COLUMN "demarcheId" SET NOT NULL')
    }


    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE "custom_filter" DROP COLUMN "demarcheId"')
    }
}
