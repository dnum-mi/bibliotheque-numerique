import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { createOneRole, role_test } from "../../../shared/entities/__tests__";
import { Role } from "./role.entity";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";

describe("role.entity", () => {
  beforeAll(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRootAsync(typeormFactoryLoader)],
    }).compile();
  });

  afterEach(async () => {
    await Role.delete({});
  });

  it("create entity", async () => {
    const data = role_test();

    const role = await createOneRole(data);

    expect(role).toHaveProperty("id");
    expect(role.name).toBe(data.name);
    expect(role.description).toBe(data.description);
    expect(role.permissions).toStrictEqual(data.permissions);
    const nowDate = new Date().toDateString();
    expect(role.createAt.toDateString()).toBe(nowDate);
    expect(role.updateAt.toDateString()).toBe(nowDate);
  });
});
