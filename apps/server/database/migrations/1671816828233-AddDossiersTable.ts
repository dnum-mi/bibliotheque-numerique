import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class AddDossiersTable1671816828233 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'dossiers',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            primaryKeyConstraintName: 'PK_DOSSIER_ID',
          },
          {
            name: 'state',
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
            name: 'dossierDSId',
            type: 'int',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'demarcheId',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
      true,
    )

    await queryRunner.createForeignKey(
      'dossiers',
      new TableForeignKey({
        columnNames: ['dossierDSId'],
        name: 'FK_DOSSIER_DS_ID',
        referencedColumnNames: ['id'],
        referencedTableName: 'dossiers_ds',
        onDelete: 'CASCADE',
      }),
    )

    await queryRunner.createForeignKey(
      'dossiers',
      new TableForeignKey({
        columnNames: ['demarcheId'],
        name: 'FK_DEMARCHE_ID',
        referencedColumnNames: ['id'],
        referencedTableName: 'demarches',
        onDelete: 'CASCADE',
      }),
    )
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('dossiers')

    const foreignKeyDossierDS = table.foreignKeys.find((fk) => fk.columnNames.indexOf('dossierDSId') !== -1)
    await queryRunner.dropForeignKey('dossiers', foreignKeyDossierDS)
    await queryRunner.dropColumn('dossiers', 'dossierDSId')

    const foreignKeyDemarche = table.foreignKeys.find((fk) => fk.columnNames.indexOf('demarcheId') !== -1)
    await queryRunner.dropForeignKey('dossiers', foreignKeyDemarche)
    await queryRunner.dropColumn('dossiers', 'demarcheId')

    await queryRunner.dropTable('dossiers')
  }
}
