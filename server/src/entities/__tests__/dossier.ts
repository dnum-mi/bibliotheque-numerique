import { faker } from "@faker-js/faker/locale/fr";
import { Demarche, Dossier, DossierDS } from "..";

export function dossier_test(
  dossierDS: DossierDS,
  demarche?: Demarche,
): Partial<Dossier> {
  return {
    dossierDS,
    demarche,
    state: faker.datatype.string(),
  };
}
