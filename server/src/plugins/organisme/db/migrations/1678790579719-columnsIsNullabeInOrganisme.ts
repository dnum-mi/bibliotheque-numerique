import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class columnsIsNullabeInOrganisme1678790579719
  implements MigrationInterface
{
  tableName = "organismes";
  columnsToUpdate = [
    {
      type: "varchar",
      isNullable: true,
      name: "address",
    },
    {
      type: "varchar",
      isNullable: true,
      name: "zipCode",
    },
    {
      type: "varchar",
      isNullable: true,
      name: "city",
    },
    {
      type: "varchar",
      isNullable: true,
      name: "typeStructure",
    },
    {
      type: "varchar",
      isNullable: true,
      name: "leaderName",
    },
    {
      type: "timestamp",
      isNullable: true,
      name: "dateDeclaration",
    },
    {
      type: "timestamp",
      isNullable: true,
      name: "datePublication",
    },
    {
      name: "dateModification",
      type: "timestamp",
      isNullable: true,
    },
    {
      name: "dateDissolution",
      type: "timestamp",
      isNullable: true,
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      this.columnsToUpdate.map(({ name, type, isNullable }) =>
        queryRunner.changeColumn(
          this.tableName,
          name,
          new TableColumn({
            name,
            type,
            isNullable,
          }),
        ),
      ),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      this.columnsToUpdate.map(({ name, type }) =>
        queryRunner.changeColumn(
          this.tableName,
          name,
          new TableColumn({
            name,
            type,
          }),
        ),
      ),
    );
  }
}
