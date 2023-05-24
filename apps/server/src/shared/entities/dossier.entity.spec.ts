import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { DossierDS, Demarche, DemarcheDS, Dossier } from "./index";
import {
  datasourceTest,
  dossier_test,
  createOneDossierDs,
  dossier_ds_test,
} from "./__tests__";

describe("dossier_ds.entity", () => {
  let dataSource: DataSource;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([DossierDS, Dossier, Demarche, DemarcheDS]).options,
        ),
      ],
    }).compile();
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await Dossier.delete({});
    await DossierDS.delete({});
  });

  afterAll(async () => {
    await dataSource.destroy();
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
