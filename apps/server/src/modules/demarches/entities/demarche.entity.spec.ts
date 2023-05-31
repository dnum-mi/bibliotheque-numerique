import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import {
  datasourceTest,
  createOneDemarcheDs,
  demarche_ds_test,
  demarche_test,
} from "../../../shared/entities/__tests__";
import { Demarche } from "./demarche.entity";
import { DemarcheDS } from "./demarche_ds.entity";
import { Dossier } from "../../dossiers/entities/dossier.entity";
import { DossierDS } from "../../dossiers/entities/dossier_ds.entity";

describe("demarche.entity", () => {
  let dataSource: DataSource;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([Demarche, DemarcheDS, Dossier, DossierDS]).options,
        ),
      ],
    }).compile();
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await Demarche.delete({});
    await DemarcheDS.delete({});
  });

  afterAll(async () => {
    await dataSource.destroy();
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
