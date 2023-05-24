import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import {
  datasourceTest,
  createOneDemarcheDs,
  demarche_ds_test,
} from "../../../shared/entities/__tests__";
import { DemarcheDS } from "./demarche_ds.entity";

describe("demarche_ds.entity", () => {
  let dataSource: DataSource;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(datasourceTest([DemarcheDS]).options)],
    }).compile();
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await DemarcheDS.delete({});
  });
  afterAll(async () => {
    await dataSource.destroy();
  });

  it("create entity", async () => {
    const data = demarche_ds_test();
    const demarcheDsSaved = await createOneDemarcheDs(data);
    expect(demarcheDsSaved).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(demarcheDsSaved.createAt.toDateString()).toBe(nowDate);
    expect(demarcheDsSaved.updateAt.toDateString()).toBe(nowDate);
  });
});
