import { faker } from "@faker-js/faker/locale/fr";
import { OrganismesSource } from "..";
import { TypeAuth } from "../../../../entities/connector_source_entity";

export function organismeSource_test(): Partial<OrganismesSource> {
  return {
    sourceName: faker.internet.userName(),
    method: faker.helpers.arrayElement(["GET", "POST"]),
    url: faker.internet.url(),
    params: faker.datatype.array(2).map((a) => a.toString()),
    query: {
      query1: faker.datatype.string(5),
      query2: faker.datatype.string(5),
    },
    typeAuth: TypeAuth.BEARER_TOKEN,
    token: faker.internet.password(),
  };
}
export const createOneOrganismeSource = async (data) => {
  const organismeSource = OrganismesSource.create();
  for (const entry in data) {
    organismeSource[entry] = data[entry];
  }
  return await organismeSource.save();
};
