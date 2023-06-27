import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  createOneDossierDs,
  dossier_ds_test,
} from "../../../shared/entities/__tests__";
import { DossierDS } from "./dossier_ds.entity";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";

describe("dossier_ds.entity", () => {
  beforeAll(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRootAsync(typeormFactoryLoader)],
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
