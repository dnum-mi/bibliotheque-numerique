import { faker } from '@faker-js/faker/locale/fr'
import { Demarche } from '../../../src/modules/demarches/objects/entities/demarche.entity'

export const getFakeDemarche = (): Demarche =>
  ({
    demarcheDS: faker.datatype.json(),
    state: faker.datatype.string(),
    title: faker.datatype.string(),
    dossiers: [JSON.parse(faker.datatype.json())],
    typeOrganisme: faker.datatype.string(),
    mappingColumns: [JSON.parse(faker.datatype.json())],
    createAt: faker.date.past(),
    updateAt: faker.date.past(),
  } as unknown as Demarche)
