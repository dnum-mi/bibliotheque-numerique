import { faker } from "@faker-js/faker/locale/fr";
import { Demarche, Dossier, DossierDS } from "../index";
import { DossierState } from "@dnum-mi/ds-api-client/dist/@types/types";

export function dossier_test(
  dossierDS: DossierDS,
  demarche?: Demarche,
): Partial<Dossier> {
  return {
    dossierDS,
    demarche,
    state: faker.datatype.string() as unknown as DossierState,
  };
}
