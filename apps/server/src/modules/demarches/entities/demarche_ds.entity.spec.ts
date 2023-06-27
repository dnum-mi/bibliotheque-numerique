import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  createOneDemarcheDs,
  demarche_ds_test,
} from "../../../shared/entities/__tests__";
import { DemarcheDS } from "./demarche_ds.entity";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";

describe("demarche_ds.entity", () => {
  beforeAll(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRootAsync(typeormFactoryLoader)],
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
