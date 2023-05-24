import { faker } from "@faker-js/faker/locale/fr";
import { Demarche, DemarcheDS } from "../index";

export function demarche_test(demarcheDS: DemarcheDS): Partial<Demarche> {
  return {
    demarcheDS,
    state: faker.datatype.string(),
    title: faker.datatype.string(),
    identification: faker.datatype.string(),
    mappingColumns: [JSON.parse(faker.datatype.json())] as any[],
  };
}
