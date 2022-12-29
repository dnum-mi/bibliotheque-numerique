import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DossierDS, Demarche, DemarcheDS, Dossier } from ".";
import {
  datasourceTest,
  dossier_test,
  createOneDossierDs,
  dossier_ds_test,
} from "./__tests__";

describe("dossier_ds.entity", () => {
  beforeEach(async () => {
    await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([DossierDS, Dossier, Demarche, DemarcheDS]).options,
        ),
      ],
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
