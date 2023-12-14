import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class AddDemarchesTable1671815826887 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'demarches',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            primaryKeyConstraintName: 'PK_DEMARCHE_ID',
          },
          {
            name: 'state',
            type: 'varchar',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'createAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updateAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'idDemarcheDS',
            type: 'int',
            isUnique: true,
            isNullable: true,
          },
        ],
      }),
      true,
    )

    await queryRunner.createForeignKey(
      'demarches',
      new TableForeignKey({
        columnNames: ['idDemarcheDS'],
        name: 'FK_DEMARCHE_DS_ID',
        referencedColumnNames: ['id'],
        referencedTableName: 'demarches_ds',
        onDelete: 'CASCADE',
      }),
    )
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('demarches')
    const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('idDemarcheDS') !== -1)
    await queryRunner.dropForeignKey('demarches', foreignKey)
    await queryRunner.dropColumn('demarches', 'idDemarcheDS')

    await queryRunner.dropTable('demarches')
  }
}
