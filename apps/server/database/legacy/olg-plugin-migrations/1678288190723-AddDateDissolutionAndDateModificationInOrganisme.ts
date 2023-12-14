import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddDateDissolutionAndDateModificationInOrganisme1678288190723 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'organismes',
      new TableColumn({
        name: 'dateModification',
        type: 'timestamp',
      }),
    )
    await queryRunner.addColumn(
      'organismes',
      new TableColumn({
        name: 'dateDissolution',
        type: 'timestamp',
      }),
    )
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('organismes', 'dateModification')
    await queryRunner.dropColumn('organismes', 'dateDissolution')
  }
}
