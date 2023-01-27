import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Organisme } from ".";
import {
  datasourceTest,
  organisme_test,
  createOneOrganisme,
} from "./__tests__";
import { DataSource } from "typeorm";

describe("Organisme.entity", () => {
  let dataSource: DataSource;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(datasourceTest([Organisme]).options)],
    }).compile();
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await Organisme.delete({});
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("create entity", async () => {
    const data = organisme_test();

    const organisme = await createOneOrganisme(data);

    expect(organisme).toHaveProperty("id");
    expect(organisme).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(organisme.createAt.toDateString()).toBe(nowDate);
    expect(organisme.updateAt.toDateString()).toBe(nowDate);
  });
});
