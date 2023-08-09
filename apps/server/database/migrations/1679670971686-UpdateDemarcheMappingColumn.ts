import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateDemarcheMappingColumn1679670971686 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'demarches',
      new TableColumn({
        name: 'mappingColumns',
        type: 'jsonb',
        default: "('[]')",
      }),
    )
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('demarches', 'mappingColumns')
  }
}
