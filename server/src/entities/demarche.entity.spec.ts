import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Demarche, DemarcheDS, Dossier, DossierDS } from ".";
import {
  datasourceTest,
  createOneDemarcheDs,
  demarche_ds_test,
  demarche_test,
} from "./__tests__";

describe("demarche.entity", () => {
  beforeEach(async () => {
    await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([Demarche, DemarcheDS, Dossier, DossierDS]).options,
        ),
      ],
    }).compile();
  });

  afterEach(async () => {
    await Demarche.delete({});
    await DemarcheDS.delete({});
  });

  it("create entity", async () => {
    const dataDs = demarche_ds_test();
    const demarcheDsSaved = await createOneDemarcheDs(dataDs);

    const data = demarche_test(demarcheDsSaved);

    const demarche = Demarche.create();
    for (const entry in data) {
      demarche[entry] = data[entry];
    }

    const demarcheSaved = await demarche.save();

    expect(demarcheSaved).toHaveProperty("id");
    expect(demarcheSaved).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(demarcheSaved.createAt.toDateString()).toBe(nowDate);
    expect(demarcheSaved.updateAt.toDateString()).toBe(nowDate);
    expect(demarcheSaved.demarcheDS).toBe(demarcheDsSaved);

    // TODO: A vérifier: non tableau vide ou undefined
    expect(demarcheSaved.dossiers).toBeUndefined();
  });
});
