import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOrganismeErrorFlag1775652853111 implements MigrationInterface {
    name = 'RemoveOrganismeErrorFlag1775652853111'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        UPDATE fields SET "stringValue" = REGEXP_REPLACE("stringValue", '^ERROR-*', '')
        WHERE "stringValue" LIKE 'ERROR-%' AND "formatFunctionRef" IN ('rna', 'rnf')
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      // Impossible de restaurer les préfixes "ERROR-" une fois supprimés, car on ne peut pas différencier les valeurs d'origine des valeurs déjà corrigées.
      // Par conséquent, la migration inverse est laissée vide.
    }

}
