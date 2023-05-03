import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import { Organisme, OrganismesData } from "../../plugins/organisme/entities";
import { AppDataSource } from "../app-data-source";

export class UpdateOrganisme1679562953126 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const addEmails = queryRunner.addColumn(
      "organismes",
      new TableColumn({
        name: "emails",
        type: "jsonb",
        isNullable: true,
      }),
    );
    const addPhoneNumbers = queryRunner.addColumn(
      "organismes",
      new TableColumn({
        name: "phoneNumbers",
        type: "jsonb",
        isNullable: true,
      }),
    );
    await Promise.all([addEmails, addPhoneNumbers]);
    // TODO: UPDATE TABLES ROWS
    // Update doesn't work
    // const OrganismeSource = AppDataSource.getRepository(Organisme);
    // const OrganismesDataSource = AppDataSource.getRepository(OrganismesData);
    // const organismesDatas = await OrganismesDataSource.find();
    // const promiseArray: Promise<any>[] = [];
    // for (const organismesData of organismesDatas) {
    //   const organisme = await OrganismeSource.findOne({
    //     where: { idRef: organismesData.idRef },
    //   });
    //   if (organisme) {
    //     organismesData.organisme = organisme;
    //     promiseArray.push(organismesData.save());
    //   }
    // }
    // await Promise.all(promiseArray);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const removeEmailColumn = queryRunner.dropColumn("organismes", "emails");
    const removePhoneNumbersColumn = queryRunner.dropColumn(
      "organismes",
      "phoneNumbers",
    );

    await Promise.all([removeEmailColumn, removePhoneNumbersColumn]);
  }
}
