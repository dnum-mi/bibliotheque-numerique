import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Organisme } from ".";
import { createOneOrganisme, organisme_test } from "./__tests__";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";

describe("Organisme.entity", () => {
  beforeAll(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRootAsync(typeormFactoryLoader)],
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
