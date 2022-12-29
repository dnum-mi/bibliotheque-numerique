import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DemarcheDS } from ".";
import {
  datasourceTest,
  createOneDemarcheDs,
  demarche_ds_test,
} from "./__tests__";

describe("demarche_ds.entity", () => {
  beforeEach(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(datasourceTest([DemarcheDS]).options)],
    }).compile();
  });

  afterEach(async () => {
    await DemarcheDS.delete({});
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
