import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { OrganismesData, OrganismesSource } from ".";
import {
  datasourceTest,
  organismeData_test,
  createOneOrganismeData,
} from "./__tests__";
import { DataSource } from "typeorm";

describe("OrganismeData.entity", () => {
  let dataSource: DataSource;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([OrganismesData, OrganismesSource]).options,
        ),
      ],
    }).compile();
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await OrganismesData.delete({});
  });

  afterAll(() => {
    dataSource.destroy();
  });

  it("create entity", async () => {
    const data = organismeData_test();

    const organismeData = await createOneOrganismeData(data);

    expect(organismeData).toHaveProperty("id");
    expect(organismeData).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(organismeData.createAt.toDateString()).toBe(nowDate);
    expect(organismeData.updateAt.toDateString()).toBe(nowDate);
  });
});
