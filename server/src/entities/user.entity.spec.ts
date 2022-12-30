import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Role, User } from ".";
import { datasourceTest, user_test, createOneUser } from "./__tests__";
import * as bcrypt from "bcrypt";

describe("user.entity", () => {
  beforeEach(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(datasourceTest([User, Role]).options)],
    }).compile();
  });

  afterEach(async () => {
    await User.delete({});
  });

  it("create entity", async () => {
    const data = user_test();

    const user = await createOneUser(data);

    expect(user).toHaveProperty("id");
    expect(user.email).toBe(data.email);
    expect(await bcrypt.compare(data.password, user.password)).toBe(true);
    const nowDate = new Date().toDateString();
    expect(user.createAt.toDateString()).toBe(nowDate);
    expect(user.updateAt.toDateString()).toBe(nowDate);
  });
});
