import { faker } from "@faker-js/faker/locale/fr";
import { FileStorage } from "../../../modules/files/file_storage.entity";

export function file_storage_test(): Partial<FileStorage> {
  return {
    id: faker.datatype.uuid(),
    name: faker.system.fileName(),
    path: faker.internet.url(),
    originalName: faker.system.fileName(),
    checksum: faker.random.alpha(),
    byteSize: faker.datatype.number(),
    mimeType: faker.system.mimeType(),
  };
}
// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createOneFileStorage = async (data) => {
  const fileStorage = FileStorage.create();
  for (const entry in data) {
    fileStorage[entry] = data[entry];
  }
  return await fileStorage.save();
};
