import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from "typeorm";

export class AddRoleTable1671721263612 implements MigrationInterface {
  name = "AddRoleTable1671721263612";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "roles",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
            primaryKeyConstraintName: "PK_ROLE_ID",
          },
          {
            name: "name",
            isUnique: true,
            type: "varchar",
          },
          {
            name: "description",
            type: "varchar",
          },
          {
            name: "createAt",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updateAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );
    await queryRunner.createTable(
      new Table({
        name: "users_roles",
        columns: [
          {
            name: "rolesId",
            type: "int",
          },
          {
            name: "usersId",
            type: "int",
          },
          {
            name: "createAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );

    await queryRunner.createUniqueConstraint(
      "roles",
      new TableUnique({ name: "UK_ROLE_NAME", columnNames: ["name"] }),
    );

    await queryRunner.createPrimaryKey(
      "users_roles",
      ["rolesId", "usersId"],
      "PK_USERS_ROLES_ID",
    );

    await queryRunner.createIndex(
      "users_roles",
      new TableIndex({
        name: "IDX_USERS_ROLES_USERS",
        columnNames: ["usersId"],
      }),
    );
    await queryRunner.createIndex(
      "users_roles",
      new TableIndex({
        name: "IDX_USERS_ROLES_ROLES",
        columnNames: ["rolesId"],
      }),
    );
    await queryRunner.createForeignKey(
      "users_roles",
      new TableForeignKey({
        columnNames: ["usersId"],
        name: "FK_USER_ID",
        referencedColumnNames: ["id"],
        referencedTableName: "users",
      }),
    );
    await queryRunner.createForeignKey(
      "users_roles",
      new TableForeignKey({
        columnNames: ["rolesId"],
        name: "FK_ROLE_ID",
        referencedColumnNames: ["id"],
        referencedTableName: "roles",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropPrimaryKey("roles", "PK_ROLE_ID");
    await queryRunner.dropPrimaryKey("users_roles", "PK_USERS_ROLES_ID");
    await queryRunner.dropIndex("users_roles", "IDX_USERS_ROLES_USERS");
    await queryRunner.dropIndex("users_roles", "IDX_USERS_ROLES_ROLES");
    await queryRunner.dropForeignKey("users_roles", "FK_USER_ID");
    await queryRunner.dropForeignKey("users_roles", "FK_ROLE_ID");
    await queryRunner.dropTable("users_roles");
    await queryRunner.dropTable("roles");
  }
}
