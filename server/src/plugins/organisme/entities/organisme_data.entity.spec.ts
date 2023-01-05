import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { OrganismesData, OrganismesSource } from ".";
import {
  datasourceTest,
  organismeData_test,
  createOneOrganismeData,
} from "./__tests__";

describe("OrganismeData.entity", () => {
  beforeEach(async () => {
    await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([OrganismesData, OrganismesSource]).options,
        ),
      ],
    }).compile();
  });

  afterEach(async () => {
    await OrganismesData.delete({});
  });

  it("create entity", async () => {
    const data = organismeData_test();

    const organismeData = await createOneOrganismeData(data);

    expect(organismeData).toHaveProperty("id");
    expect(organismeData).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(organismeData.createAt.toDateString()).toBe(nowDate);
    expect(organismeData.updateAt.toDateString()).toBe(nowDate);
  });
});
