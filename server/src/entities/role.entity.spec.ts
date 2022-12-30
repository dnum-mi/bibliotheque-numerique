import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Role, User } from ".";
import { datasourceTest, role_test, createOneRole } from "./__tests__";

describe("role.entity", () => {
  beforeEach(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(datasourceTest([Role, User]).options)],
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
    const nowDate = new Date().toDateString();
    expect(role.createAt.toDateString()).toBe(nowDate);
    expect(role.updateAt.toDateString()).toBe(nowDate);
  });
});
