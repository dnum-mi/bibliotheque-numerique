import type {
  IAgGridUser,
  IPaginated,
  IUserOutput,

  IRole,
} from '@biblio-num/shared'
import { faker } from '@faker-js/faker/locale/fr'

const noRole: IRole = {
  label: null,
  options: {},
}

const adminRole: IRole = {
  label: 'admin',
  options: {
    1: {

      national: false,
      prefectures: ['95', '94'],
    },
    2: {

      national: true,
      prefectures: [],
    },
  },
}

const instructeurRole: IRole = {
  label: 'instructor',
  options: {
    1: {
      national: true,
      prefectures: ['95', '94'],
    },
    2: {
      national: true,
      prefectures: [],
    },
  },
}

export const createRandomUser = (id?: number): IAgGridUser => ({
  id: id || faker.helpers.unique(faker.datatype.number, [1000]),
  lastname: faker.internet.userName(),
  firstname: faker.internet.userName(),
  email: faker.internet.email(),
  job: '',
  roleLabel: noRole.label,
  roleOptionsResume: 'FDD(2), FE(5)',
})

const adminUsersFn = () => Array.from({ length: faker.datatype.number({ min: 1, max: 3 }) }, createRandomUser)
  .map(user => ({
    ...user,
    roleLabel: adminRole.label,
    roleOptionsResume: 'FDD(2), FE(5)',
  }))

const instructeurUsersFn = () => Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, createRandomUser)
  .map(user => ({
    ...user,
    role: instructeurRole.label,
    roleOptionsResume: 'FDD(2), FE(5)',
  }))

export const getPaginatedUsers = () => {
  const usersRoles:Partial<IAgGridUser>[] = [
    ...Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, createRandomUser),
    ...adminUsersFn(),
    ...instructeurUsersFn(),
  ]
  const result: IPaginated<IAgGridUser> = {
    total: usersRoles.length,
    data: usersRoles,
  }
  return result
}
