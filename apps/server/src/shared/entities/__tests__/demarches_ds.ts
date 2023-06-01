import { faker } from "@faker-js/faker/locale/fr";
import { Demarche as TDemarche } from "@dnum-mi/ds-api-client/dist/@types/types";
import { DemarcheDS } from "../../../modules/demarches/entities/demarche_ds.entity";

export function demarche_ds_test(): Partial<DemarcheDS> {
  return {
    id: faker.datatype.number(),
    dataJson: JSON.parse(faker.datatype.json()) as TDemarche,
    dsUpdateAt: faker.date.past(),
  };
}

// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createOneDemarcheDs = async (data: Partial<DemarcheDS>) => {
  const demarcheDs = DemarcheDS.create();
  for (const entry in data) {
    demarcheDs[entry] = data[entry];
  }
  return await demarcheDs.save();
};
