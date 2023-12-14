import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class AddUserTable1670323118943 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
          },
          {
            name: 'password',
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
        ],
      }),
      true,
    )

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USER_EMAIL',
        columnNames: ['email'],
      }),
    )
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_USER_EMAIL')
    await queryRunner.dropTable('users')
  }
}
