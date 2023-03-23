import { faker } from "@faker-js/faker/locale/fr";
import {
  getDatasFromRNA,
  idRNAFake,
} from "../../organismes_datas/__tests__/organismeFromRNA";
import { OrganismesData } from "../../entities";

export function getOrganismesData(): OrganismesData {
  const idRNA = idRNAFake();
  return {
    organismesSource: "API_ENTREPRISE_RNA_V3",
    id: faker.datatype.number(),
    idRef: idRNA,
    dataJson: JSON.parse(JSON.stringify(getDatasFromRNA(idRNA))),
    dataUpdateAt: faker.date.past(),
    createAt: faker.date.past(),
    updateAt: faker.date.past(),
  } as unknown as OrganismesData;
}
