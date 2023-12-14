import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm'

export class UpdateOrganismesData1679502345235 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'organismes_datas',
      new TableColumn({
        name: 'organismeId',
        type: 'int',
        isNullable: true,
        foreignKeyConstraintName: 'FK_ORGANISMES_DATAS_ORGANISMES',
      }),
    )
    await queryRunner.createForeignKey(
      'organismes_datas',
      new TableForeignKey({
        name: 'FK_ORGANISMES_DATAS_ORGANISMES',
        columnNames: ['organismeId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organismes',
      }),
    )
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('organismes_datas', 'FK_ORGANISMES_DATAS_ORGANISMES')
    await queryRunner.dropColumn('organismes_datas', 'organismeId')
  }
}
