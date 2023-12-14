import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UpdateRoleTable1677259158670 implements MigrationInterface {
  name = 'UpdateRoleTable1677259158670'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'roles',
      new TableColumn({
        name: 'permissions',
        type: 'jsonb',
        default: "'[]'",
      }),
    )
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('roles', 'permissions')
  }
}
