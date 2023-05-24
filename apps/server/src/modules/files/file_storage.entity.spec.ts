import { Test } from "@nestjs/testing";
import { DataSource } from "typeorm";

import { FileStorage } from "./index";
import {
  datasourceTest,
  createOneFileStorage,
  file_storage_test,
} from "../../shared/entities/__tests__";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileStorage } from "./file_storage.entity";

describe("file_storages.entity", () => {
  let dataSource: DataSource;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(datasourceTest([FileStorage]).options)],
    }).compile();
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await FileStorage.delete({});
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("create entity", async () => {
    const data = file_storage_test();

    const fileStorageSaved = await createOneFileStorage(data);

    expect(fileStorageSaved).toHaveProperty("id");
    expect(fileStorageSaved).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(fileStorageSaved.createAt.toDateString()).toBe(nowDate);
    expect(fileStorageSaved.updateAt.toDateString()).toBe(nowDate);
  });
});
