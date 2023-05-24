import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { InstructionTime } from ".";
import {
  datasourceTest,
  instructionTime_test,
  createOneInstructionTime,
} from "./__tests__";
import { DataSource } from "typeorm";
import {
  createOneDossierDs,
  dossier_ds_test,
  dossier_test,
} from "../../../shared/entities/__tests__";
import {
  Demarche,
  DemarcheDS,
  Dossier,
  DossierDS,
} from "../../../shared/entities";

describe("InstructionTime.entity", () => {
  let dataSource: DataSource;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([
            InstructionTime,
            Dossier,
            DossierDS,
            Demarche,
            DemarcheDS,
          ]).options,
        ),
      ],
    }).compile();
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await InstructionTime.delete({});
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("create entity", async () => {
    const dataDs = dossier_ds_test();
    const dossierDs = await createOneDossierDs(dataDs);
    const dossier = dossier_test(dossierDs);

    const data = instructionTime_test(dossier as any);
    const instructionTime = await createOneInstructionTime(data);

    expect(instructionTime).toHaveProperty("id");
    expect(instructionTime).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(instructionTime.createAt.toDateString()).toBe(nowDate);
    expect(instructionTime.updateAt.toDateString()).toBe(nowDate);
  });
});
