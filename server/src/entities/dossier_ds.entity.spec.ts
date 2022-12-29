import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DossierDS } from ".";
import {
  datasourceTest,
  createOneDossierDs,
  dossier_ds_test,
} from "./__tests__";

describe("dossier_ds.entity", () => {
  beforeEach(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(datasourceTest([DossierDS]).options)],
    }).compile();
  });

  afterEach(async () => {
    await DossierDS.delete({});
  });

  it("create entity", async () => {
    const data = dossier_ds_test();

    const dossierDsSaved = await createOneDossierDs(data);

    expect(dossierDsSaved).toHaveProperty("id");
    expect(dossierDsSaved).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(dossierDsSaved.createAt.toDateString()).toBe(nowDate);
    expect(dossierDsSaved.updateAt.toDateString()).toBe(nowDate);
  });
});
