import { faker } from '@faker-js/faker/locale/fr'

export const getFileObjectExample = () => ({
  uuid: faker.string.uuid(),
  checksum: faker.string.sample(),
  filename: faker.system.fileName(),
  contentType: faker.system.mimeType(),
  byteSizeBigInt: faker.datatype.bigInt(),
})
