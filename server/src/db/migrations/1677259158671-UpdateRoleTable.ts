import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateRoleTable1677259158671 implements MigrationInterface {
  name = "UpdateRoleTable1677259158671";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const updateDescription = queryRunner.changeColumn(
      "roles",
      "description",
      new TableColumn({
        name: "description",
        type: "varchar",
        isNullable: true,
      }),
    );
    const updatePermission = await queryRunner.changeColumn(
      "roles",
      "permissions",
      new TableColumn({
        name: "permissions",
        type: "jsonb",
        default: "'[]'",
      }),
    );
    await Promise.all([updateDescription, updatePermission]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const updateDescription = queryRunner.changeColumn(
      "roles",
      "description",
      new TableColumn({
        name: "description",
        type: "varchar",
      }),
    );
    const updatePermission = await queryRunner.changeColumn(
      "roles",
      "permissions",
      new TableColumn({
        name: "permissions",
        type: "jsonb",
      }),
    );
    await Promise.all([updateDescription, updatePermission]);
  }
}
