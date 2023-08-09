import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddTypeOrganismeInDemarche1672006198177 implements MigrationInterface {
  name = 'AddTypeOrganismeInDemarche1672006198177'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'demarches',
      new TableColumn({
        name: 'typeOrganisme',
        type: 'varchar',
        isNullable: true,
      }),
    )
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('demarches', 'typeOrganisme')
  }
}
