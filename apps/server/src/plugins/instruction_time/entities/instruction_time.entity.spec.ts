import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { InstructionTime } from ".";
import { createOneInstructionTime, instructionTime_test } from "./__tests__";
import {
  createOneDossierDs,
  dossier_ds_test,
  dossier_test,
} from "../../../shared/entities/__tests__";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";

describe("InstructionTime.entity", () => {
  beforeAll(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRootAsync(typeormFactoryLoader)],
    }).compile();
  });

  afterEach(async () => {
    await InstructionTime.delete({});
  });

  it("create entity", async () => {
    const dataDs = dossier_ds_test();
    const dossierDs = await createOneDossierDs(dataDs);
    const dossier = dossier_test(dossierDs);

    // TODO: fixe type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = instructionTime_test(dossier as any);
    const instructionTime = await createOneInstructionTime(data);

    expect(instructionTime).toHaveProperty("id");
    expect(instructionTime).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(instructionTime.createAt.toDateString()).toBe(nowDate);
    expect(instructionTime.updateAt.toDateString()).toBe(nowDate);
  });
});
