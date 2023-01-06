import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { OrganismesData, OrganismesSource } from ".";
import {
  datasourceTest,
  organismeSource_test,
  createOneOrganismeSource,
} from "./__tests__";
import { DataSource } from "typeorm";

describe("OrganismeSource.entity", () => {
  let dataSource: DataSource;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([OrganismesSource, OrganismesData]).options,
        ),
      ],
    }).compile();
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await OrganismesSource.delete({});
  });

  afterAll(() => {
    dataSource.destroy();
  });

  it("create entity", async () => {
    const data = organismeSource_test();

    const organismeSource = await createOneOrganismeSource(data);

    expect(organismeSource).toHaveProperty("id");
    expect(organismeSource).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(organismeSource.createAt.toDateString()).toBe(nowDate);
    expect(organismeSource.updateAt.toDateString()).toBe(nowDate);
  });
});
