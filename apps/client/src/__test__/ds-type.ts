import { faker } from '@faker-js/faker/locale/fr'

export const getFileObjectExample = () => ({
  url: faker.internet.url(),
  checksum: faker.datatype.string(),
  filename: faker.system.fileName(),
  contentType: faker.system.mimeType(),
  byteSizeBigInt: faker.datatype.bigInt(),
})
