import { faker } from "@faker-js/faker/locale/fr";
import { Demarche as TDemarche } from "@dnum-mi/ds-api-client/dist/@types/types";
import { DemarcheDS } from "..";

export function demarche_ds_test(): Partial<DemarcheDS> {
  return {
    id: faker.datatype.number(),
    dataJson: JSON.parse(faker.datatype.json()) as TDemarche,
    dsUpdateAt: faker.date.past(),
  };
}

export const createOneDemarcheDs = async (data: Partial<DemarcheDS>) => {
  const demarcheDs = DemarcheDS.create();
  for (const entry in data) {
    demarcheDs[entry] = data[entry];
  }
  return await demarcheDs.save();
};
