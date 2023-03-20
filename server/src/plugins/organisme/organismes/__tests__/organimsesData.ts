import { faker } from "@faker-js/faker/locale/fr";
import {
  getDatasFromRNA,
  idRNAFake,
} from "../../organismes_datas/__tests__/organismeFromRNA";

export function getOrganismesData() {
  const idRNA = idRNAFake();
  return {
    organismesSource: "API_ENTREPRISE_RNA_V3",
    id: faker.datatype.number(),
    idRef: idRNA,
    dataJson: JSON.parse(JSON.stringify(getDatasFromRNA(idRNA))),
    dataUpdateAt: faker.date.past(),
    createAt: faker.date.past(),
    updateAt: faker.date.past(),
  };
}
