import { faker } from "@faker-js/faker/locale/fr";
import {
  Connector,
  TypeAuth,
} from "../../../modules/connector/connector.entity";

export const connectorTest = (): Partial<Connector> => ({
  name: faker.internet.userName(),
  method: faker.helpers.arrayElement(["GET", "POST"]),
  url: faker.internet.url(),
  params: faker.datatype.array(2).map((a) => a.toString()),
  query: {
    query1: faker.datatype.string(5),
    query2: faker.datatype.string(5),
  },
  typeAuth: TypeAuth.BEARER_TOKEN,
  token: faker.internet.password(),
});

// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createOneConnector = async (data) => {
  const connectorSource = Connector.create();
  for (const entry in data) {
    connectorSource[entry] = data[entry];
  }
  return await connectorSource.save();
};
