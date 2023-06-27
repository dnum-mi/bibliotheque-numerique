import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  createOneDemarcheDs,
  demarche_ds_test,
  demarche_test,
} from "../../../shared/entities/__tests__";
import { Demarche } from "./demarche.entity";
import { DemarcheDS } from "./demarche_ds.entity";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";

describe("demarche.entity", () => {
  beforeAll(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRootAsync(typeormFactoryLoader)],
    }).compile();
  });

  afterEach(async () => {
    await Demarche.delete({});
    await DemarcheDS.delete({});
  });

  it("create entity with all fields", async () => {
    const dataDs = demarche_ds_test();
    const demarcheDsSaved = await createOneDemarcheDs(dataDs);

    const data = demarche_test(demarcheDsSaved);

    const demarche = Demarche.create();
    for (const entry in data) {
      demarche[entry] = data[entry];
    }

    const demarcheSaved = await demarche.save();

    expect(demarcheSaved).toHaveProperty("id");
    expect(demarcheSaved.identification).not.toBeNull();
    expect(demarcheSaved).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(demarcheSaved.createAt.toDateString()).toBe(nowDate);
    expect(demarcheSaved.updateAt.toDateString()).toBe(nowDate);
    expect(demarcheSaved.demarcheDS).toBe(demarcheDsSaved);

    // TODO: A vérifier: non tableau vide ou undefined
    expect(demarcheSaved.dossiers).toBeUndefined();
  });

  it("create entity without identification", async () => {
    const dataDs = demarche_ds_test();
    const demarcheDsSaved = await createOneDemarcheDs(dataDs);

    const data = demarche_test(demarcheDsSaved);
    delete data.identification;

    const demarche = Demarche.create();
    for (const entry in data) {
      demarche[entry] = data[entry];
    }

    const demarcheSaved = await demarche.save();

    expect(demarcheSaved).toHaveProperty("id");
    expect(demarcheSaved).toMatchObject(data);
    expect(demarcheSaved).toHaveProperty("identification", null);
    const nowDate = new Date().toDateString();
    expect(demarcheSaved.createAt.toDateString()).toBe(nowDate);
    expect(demarcheSaved.updateAt.toDateString()).toBe(nowDate);
    expect(demarcheSaved.demarcheDS).toBe(demarcheDsSaved);

    // TODO: A vérifier: non tableau vide ou undefined
    expect(demarcheSaved.dossiers).toBeUndefined();
  });
});
