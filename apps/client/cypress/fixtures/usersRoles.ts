import type { IRole, PaginatedDto, UserOutputDto } from '@biblio-num/shared'
import { faker } from '@faker-js/faker/locale/fr'

const noRole:IRole = {
  label: null,
  options: [],
}

const adminRole:IRole = {
  label: 'admin',
  options: [
    {
      idDemarche: 1,
      national: false,
      prefectures: ['95', '94'],
    },
    {
      idDemarche: 2,
      national: true,
      prefectures: [],
    },
  ],
}

const instructeurRole:IRole = {
  label: 'instructor',
  options: [
    {
      idDemarche: 1,
      national: true,
      prefectures: ['95', '94'],
    },
    {
      idDemarche: 2,
      national: true,
      prefectures: [],
    },
  ],
}

export const createRandomUser = (id?: number): UserOutputDto => ({
  id: id || faker.helpers.unique(faker.datatype.number, [1000]),
  lastname: faker.internet.userName(),
  firstname: faker.internet.userName(),
  email: faker.internet.email(),
  role: noRole,
})

const adminUsersFn = () => Array.from({ length: faker.datatype.number({ min: 1, max: 3 }) }, createRandomUser)
  .map(user => ({
    ...user,
    role: instructeurRole,
  }))

const instructeurUsersFn = () => Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, createRandomUser)
  .map(user => ({
    ...user,
    role: adminRole,
  }))

export const getPaginatedUsers = () => {
  const usersRoles:Partial<UserOutputDto>[] = [
    ...Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, createRandomUser),
    ...adminUsersFn(),
    ...instructeurUsersFn(),
  ]
  const result: PaginatedDto<UserOutputDto> = {
    total: usersRoles.length,
    data: usersRoles,
  }
  return result
}
