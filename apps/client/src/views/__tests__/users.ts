import { faker } from '@faker-js/faker/locale/fr'
import type { User } from '@/shared/interfaces'
import type { CredentialsInputDto } from '@biblio-num/shared'
import { RoleName } from '@/shared/types'

export const createRandomUserForm = (): CredentialsInputDto => ({
  email: faker.internet.email(),
  password: faker.internet.password(15) + '1Ab*',
})

export const createRandomUser = (id?: number): User => ({
  id: id || faker.helpers.unique(faker.datatype.number, [1000]),
  firstName: faker.internet.userName(),
  lastName: faker.internet.userName(),
  email: faker.internet.email(),
  roles: [],
})

export const createRandomUsers = (count: number, ids?: number[]): User[] =>
  Array.from({ length: count }, (_, i) => createRandomUser(ids?.[i] || undefined))

export const createRandomAdmin = (): User => ({
  id: faker.helpers.unique(faker.datatype.number, [1000]),
  firstName: faker.internet.userName(),
  lastName: faker.internet.userName(),
  email: faker.internet.email(),
  roles: [{
    id: 1,
    name: RoleName.ADMIN,
    description: 'Administrator',
    permissions: [],
    createAt: faker.date.past().toISOString(),
    updateAt: faker.date.past().toISOString(),
  }],
})

export const createRandomUserWithoutCreateRole = (): User => ({
  id: faker.helpers.unique(faker.datatype.number, [1000]),
  firstName: faker.internet.userName(),
  lastName: faker.internet.userName(),
  email: faker.internet.email(),
  roles: [{
    id: 1,
    name: RoleName.ADMIN_LOCAL,
    description: 'Administrator local',
    permissions: [],
    createAt: faker.date.past().toISOString(),
    updateAt: faker.date.past().toISOString(),
  }],
})
export const createRandomUserWithCreateRole = (): User => ({
  id: faker.helpers.unique(faker.datatype.number, [1000]),
  firstName: faker.internet.userName(),
  lastName: faker.internet.userName(),
  email: faker.internet.email(),
  roles: [{
    id: 1,
    name: RoleName.ADMIN_LOCAL,
    description: 'Administrator local',
    permissions: [{ name: 'CREATE_ROLE' }],
    createAt: faker.date.past().toISOString(),
    updateAt: faker.date.past().toISOString(),
  }],
})
