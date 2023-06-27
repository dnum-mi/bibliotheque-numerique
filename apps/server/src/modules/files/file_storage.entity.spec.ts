import { Test } from "@nestjs/testing";

import {
  createOneFileStorage,
  file_storage_test,
} from "../../shared/entities/__tests__";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileStorage } from "./file_storage.entity";
import { typeormFactoryLoader } from "../../shared/utils/typeorm-factory-loader";

describe("file_storages.entity", () => {
  beforeAll(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRootAsync(typeormFactoryLoader)],
    }).compile();
  });

  afterEach(async () => {
    await FileStorage.delete({});
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
