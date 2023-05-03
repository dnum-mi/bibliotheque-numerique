import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateTypeDateOrganismeDatas1681314434817
  implements MigrationInterface
{
  tableName = "organismes";
  columnsToUpdate = [
    {
      name: "dateCreation",
      oldType: "timestamp",
      type: "date",
    },
    {
      name: "dateDeclaration",
      oldType: "timestamp",
      type: "date",
    },
    {
      name: "datePublication",
      oldType: "timestamp",
      type: "date",
    },
    {
      name: "dateModification",
      oldType: "timestamp",
      type: "date",
    },
    {
      name: "dateDissolution",
      oldType: "timestamp",
      type: "date",
    },
  ];
  prefixNew = "new_";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);
    const changedColumns: { oldColumn: TableColumn; newColumn: TableColumn }[] =
      await Promise.all(
        this.columnsToUpdate.map((columnToUpdate) => {
          const oldColumn = table.findColumnByName(columnToUpdate.name);
          const newColumn = oldColumn.clone();
          newColumn.type = columnToUpdate.type;
          return {
            oldColumn,
            newColumn,
          };
        }),
      );

    await queryRunner.changeColumns(this.tableName, changedColumns);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);
    const changedColumns: { oldColumn: TableColumn; newColumn: TableColumn }[] =
      await Promise.all(
        this.columnsToUpdate.map((columnToUpdate) => {
          const oldColumn = table.findColumnByName(columnToUpdate.name);
          const newColumn = oldColumn.clone();
          newColumn.type = columnToUpdate.oldType;
          return {
            oldColumn,
            newColumn,
          };
        }),
      );

    await queryRunner.changeColumns(this.tableName, changedColumns);
  }
}
