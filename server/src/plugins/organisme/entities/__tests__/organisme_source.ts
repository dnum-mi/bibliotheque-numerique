import { faker } from "@faker-js/faker/locale/fr";
import { OrganismesSource } from "..";

export function organismeSource_test(): Partial<OrganismesSource> {
  return {
    name: faker.internet.userName(),
    url: faker.internet.url(),
    typeAuth: faker.datatype.string(10),
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
