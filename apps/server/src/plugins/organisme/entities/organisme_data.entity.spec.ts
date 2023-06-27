import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { OrganismesData } from ".";
import { createOneOrganismeData, organismeData_test } from "./__tests__";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";

describe("OrganismeData.entity", () => {
  beforeAll(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRootAsync(typeormFactoryLoader)],
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
