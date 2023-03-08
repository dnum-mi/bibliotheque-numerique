import { faker } from "@faker-js/faker/locale/fr";
import { Organisme } from "..";

export function organisme_test(): Partial<Organisme> {
  return {
    idRef: faker.datatype.uuid(),
    title: faker.datatype.string(10),
    address: faker.address.streetAddress(),
    zipCode: faker.address.zipCode(),
    city: faker.address.cityName(),
    typeStructure: faker.datatype.string(5),
    leaderName: faker.internet.userName(),
    dateCreation: faker.datatype.datetime(),
    dateDeclaration: faker.datatype.datetime(),
    datePublication: faker.datatype.datetime(),
    dateDissolution: faker.datatype.datetime(),
    dateModification: faker.datatype.datetime(),
  };
}
export const createOneOrganisme = async (data) => {
  const organisme = Organisme.create();
  for (const entry in data) {
    organisme[entry] = data[entry];
  }
  return await organisme.save();
};
