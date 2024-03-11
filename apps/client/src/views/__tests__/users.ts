import { faker } from '@faker-js/faker/locale/fr'
import type { User } from '@/shared/interfaces'
import type { ICredentialsInput } from '@biblio-num/shared'
import { RoleName } from '@/shared/types'

export const createRandomUserForm = (): ICredentialsInput => ({
  email: faker.internet.email(),
  password: `${faker.internet.password({ length: 15 })}1Ab*`,
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
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.past().toISOString(),
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
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.past().toISOString(),
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
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.past().toISOString(),
  }],
})
