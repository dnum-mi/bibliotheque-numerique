import { faker } from "@faker-js/faker/locale/fr";
import { OrganismesData } from "..";

export function organismeData_test(): Partial<OrganismesData> {
  return {
    idRef: faker.datatype.string(10),
    dataJson: JSON.parse(faker.datatype.json()),
    dataUpdateAt: faker.date.past(),
  };
}
export const createOneOrganismeData = async (data) => {
  const organismeData = OrganismesData.create();
  for (const entry in data) {
    organismeData[entry] = data[entry];
  }
  return await organismeData.save();
};
