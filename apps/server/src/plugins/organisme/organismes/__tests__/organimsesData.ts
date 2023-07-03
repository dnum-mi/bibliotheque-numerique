import { faker } from "@faker-js/faker/locale/fr";
import {
  getDatasFromRNA,
  idRNAFake,
} from "../../organismes_datas/__tests__/organismeFromRNA";
import { OrganismesData } from "../../entities";

export function getOrganismesData(): OrganismesData {
  const idRNA = idRNAFake();
  const dataUpdateAt = faker.date.past();
  const updateAt = faker.date.past(1, dataUpdateAt);

  return {
    organismesSource: {
      id: faker.datatype.number(),
      name: "API_ENTREPRISE_RNA_V3",
    },
    id: faker.datatype.number(),
    idRef: idRNA,
    dataJson: JSON.parse(JSON.stringify(getDatasFromRNA(idRNA))),
    dataUpdateAt,
    createAt: faker.date.past(),
    updateAt,
  } as unknown as OrganismesData;
}
