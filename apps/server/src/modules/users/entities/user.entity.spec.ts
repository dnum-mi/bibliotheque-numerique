import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { createOneUser, user_test } from "../../../shared/entities/__tests__";
import * as bcrypt from "bcrypt";
import { User } from "./user.entity";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";

describe("user.entity", () => {
  beforeAll(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRootAsync(typeormFactoryLoader)],
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
