import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Role, User } from ".";
import { datasourceTest, user_test, createOneUser } from "./__tests__";
import * as bcrypt from "bcrypt";
import { DataSource } from "typeorm";

describe("user.entity", () => {
  let dataSource: DataSource;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(datasourceTest([User, Role]).options)],
    }).compile();
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await User.delete({});
  });

  afterAll(() => {
    dataSource.destroy();
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
