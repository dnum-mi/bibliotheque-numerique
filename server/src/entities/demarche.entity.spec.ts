import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Demarche } from "./demarche.entity";
import { DemarcheDS } from "./demarche_ds.entity";
import { Dossier } from "./dossier.entity";
import { DossierDS } from "./dossier_ds.entity";
import { datasourceTest } from "./__tests__/datasources";
import { createOneDemarcheDs } from "./__tests__/demarches_ds";
import { demarche_test } from "./__tests__/demarche_datas";
import { demarche_ds_test } from "./__tests__/demarche_ds_datas";

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
    const dataDs = demarche_ds_test;
    const demarcheDsSaved = await createOneDemarcheDs(dataDs);

    const data = demarche_test;

    const demarche = Demarche.create();
    for (const entry in data) {
      demarche[entry] = data[entry];
    }

    demarche.demarcheDS = demarcheDsSaved;
    const demarcheSaved = await demarche.save();

    expect(demarcheSaved).toHaveProperty("id");
    expect(demarcheSaved).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(demarcheSaved.createAt.toDateString()).toBe(nowDate);
    expect(demarcheSaved.updateAt.toDateString()).toBe(nowDate);

    //TODO: A regarder contradiction dans les tests
    expect(demarcheSaved.dossiers).toEqual(expect.arrayContaining([]));
    expect(demarcheSaved.dossiers).toBeUndefined();
  });
});
