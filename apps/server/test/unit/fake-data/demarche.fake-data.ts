import { faker } from '@faker-js/faker/locale/fr'
import { Demarche } from '../../../src/modules/demarches/objects/entities/demarche.entity'

export const getFakeDemarche = (): Demarche =>
  ({
    demarcheDS: { },
    state: faker.string.sample(),
    title: faker.string.sample(),
    dossiers: [],
    typeOrganisme: faker.string.sample(),
    mappingColumns: [],
    createAt: faker.date.past(),
    updateAt: faker.date.past(),
  } as unknown as Demarche)
