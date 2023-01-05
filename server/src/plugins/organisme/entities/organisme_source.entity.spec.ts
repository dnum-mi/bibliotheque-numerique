import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { OrganismesData, OrganismesSource } from ".";
import {
  datasourceTest,
  organismeSource_test,
  createOneOrganismeSource,
} from "./__tests__";

describe("OrganismeSource.entity", () => {
  beforeEach(async () => {
    await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([OrganismesSource, OrganismesData]).options,
        ),
      ],
    }).compile();
  });

  afterEach(async () => {
    await OrganismesSource.delete({});
  });

  it("create entity", async () => {
    const data = organismeSource_test();

    const organismeSource = await createOneOrganismeSource(data);

    expect(organismeSource).toHaveProperty("id");
    expect(organismeSource).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(organismeSource.createAt.toDateString()).toBe(nowDate);
    expect(organismeSource.updateAt.toDateString()).toBe(nowDate);
  });
});
