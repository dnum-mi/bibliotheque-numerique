import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import {
  datasourceTest,
  role_test,
  createOneRole,
} from "../../../shared/entities/__tests__";
import { User } from "../../users/entities/user.entity";
import { Role } from "./role.entity";

describe("role.entity", () => {
  let dataSource: DataSource;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(datasourceTest([Role, User]).options)],
    }).compile();
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await Role.delete({});
  });

  afterAll(async () => {
    await dataSource.destroy();
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
