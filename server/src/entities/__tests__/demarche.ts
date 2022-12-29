import { faker } from "@faker-js/faker/locale/fr";
import { Demarche, DemarcheDS } from "..";

export function demarche_test(demarcheDS: DemarcheDS): Partial<Demarche> {
  return {
    demarcheDS,
    state: faker.datatype.string(),
    title: faker.datatype.string(),
  };
}
