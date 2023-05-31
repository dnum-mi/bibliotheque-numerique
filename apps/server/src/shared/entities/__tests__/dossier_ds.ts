import { faker } from "@faker-js/faker/locale/fr";
import { DossierDS } from "../../../modules/dossiers/entities/dossier_ds.entity";
// import { Dossier as TDossier } from "@dnum-mi/ds-api-client/dist/@types/types";
import { DossierDS } from "../index";

export function dossier_ds_test(): Partial<DossierDS> {
  return {
    id: faker.datatype.number(),
    //TODO: Ne doit-il pas être du type TDossier
    dataJson: JSON.parse(faker.datatype.json()),
    dsUpdateAt: faker.date.past(),
  };
}
export const createOneDossierDs = async (data) => {
  const dossierDs = DossierDS.create();
  for (const entry in data) {
    dossierDs[entry] = data[entry];
  }
  return await dossierDs.save();
};
