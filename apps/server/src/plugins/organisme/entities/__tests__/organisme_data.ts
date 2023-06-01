import { faker } from "@faker-js/faker/locale/fr";
import { OrganismesData } from "..";

export function organismeData_test(): Partial<OrganismesData> {
  return {
    idRef: faker.datatype.string(10),
    dataJson: JSON.parse(faker.datatype.json()),
    dataUpdateAt: faker.date.past(),
  };
}

// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createOneOrganismeData = async (data) => {
  const organismeData = OrganismesData.create();
  for (const entry in data) {
    organismeData[entry] = data[entry];
  }
  return await organismeData.save();
};

// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function updateDataUpdateAt(data: Partial<OrganismesData>) {
  return {
    ...data,
    dataUpdateAt: faker.date.betweens(data.dataUpdateAt, new Date()),
  };
}
