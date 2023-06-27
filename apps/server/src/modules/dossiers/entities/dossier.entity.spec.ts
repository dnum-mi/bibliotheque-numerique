import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  createOneDossierDs,
  dossier_ds_test,
  dossier_test,
} from "../../../shared/entities/__tests__";
import { DossierDS } from "./dossier_ds.entity";
import { Dossier } from "./dossier.entity";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";

describe("dossier_ds.entity", () => {
  beforeAll(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRootAsync(typeormFactoryLoader)],
    }).compile();
  });

  afterEach(async () => {
    await Dossier.delete({});
    await DossierDS.delete({});
  });

  it("create entity", async () => {
    const dataDs = dossier_ds_test();
    const dossierDs = await createOneDossierDs(dataDs);

    const data = dossier_test(dossierDs);
    const dossier = Dossier.create();
    for (const entry in data) {
      dossier[entry] = data[entry];
    }
    const dossierSaved = await dossier.save();

    expect(dossierSaved).toHaveProperty("id");
    expect(dossierSaved).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(dossierSaved.createAt.toDateString()).toBe(nowDate);
    expect(dossierSaved.updateAt.toDateString()).toBe(nowDate);

    expect(dossierSaved.dossierDS).toMatchObject(dossierDs);

    //TODO: A regarder : La demarche n'est-il pas obligatoire?
    expect(dossierSaved.demarche).toBeUndefined();
  });
});
