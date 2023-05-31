import { faker } from "@faker-js/faker/locale/fr";
import { Demarche } from "../entities/demarche.entity";

export const getDemarche = (): Demarche =>
  ({
    demarcheDS: faker.datatype.json() as any,
    state: faker.datatype.string(),
    title: faker.datatype.string(),
    dossiers: [JSON.parse(faker.datatype.json())] as any[],
    typeOrganisme: faker.datatype.string(),
    mappingColumns: [JSON.parse(faker.datatype.json())] as any[],
    createAt: faker.date.past(),
    updateAt: faker.date.past(),
  } as unknown as Demarche);
