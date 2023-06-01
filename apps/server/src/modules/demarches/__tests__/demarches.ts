import { faker } from "@faker-js/faker/locale/fr";
import { Demarche } from "../entities/demarche.entity";

export const getDemarche = (): Demarche =>
  ({
    // TODO: fixe type
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    demarcheDS: faker.datatype.json(),
    state: faker.datatype.string(),
    title: faker.datatype.string(),
    dossiers: [JSON.parse(faker.datatype.json())],
    typeOrganisme: faker.datatype.string(),
    mappingColumns: [JSON.parse(faker.datatype.json())],
    createAt: faker.date.past(),
    updateAt: faker.date.past(),
  } as unknown as Demarche);
