import { faker } from "@faker-js/faker/locale/fr";
import { DemarcheDS } from "../../../modules/demarches/entities/demarche_ds.entity";
import { Demarche } from "../../../modules/demarches/entities/demarche.entity";

export function demarche_test(demarcheDS: DemarcheDS): Partial<Demarche> {
  return {
    demarcheDS,
    state: faker.datatype.string(),
    title: faker.datatype.string(),
    identification: faker.datatype.string(),
    // TODO: fixe type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mappingColumns: <never>(<Array<any>>[JSON.parse(faker.datatype.json())]),
  };
}
