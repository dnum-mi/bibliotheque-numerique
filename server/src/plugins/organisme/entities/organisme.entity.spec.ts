import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Organisme } from ".";
import {
  datasourceTest,
  organisme_test,
  createOneOrganisme,
} from "./__tests__";

describe("Organisme.entity", () => {
  beforeEach(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(datasourceTest([Organisme]).options)],
    }).compile();
  });

  afterEach(async () => {
    await Organisme.delete({});
  });

  it("create entity", async () => {
    const data = organisme_test();

    const organisme = await createOneOrganisme(data);

    expect(organisme).toHaveProperty("id");
    expect(organisme).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(organisme.createAt.toDateString()).toBe(nowDate);
    expect(organisme.updateAt.toDateString()).toBe(nowDate);
  });
});
