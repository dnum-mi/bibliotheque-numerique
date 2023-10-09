import { faker } from '@faker-js/faker/locale/fr'
import type { User } from '@/shared/interfaces'
import type { CredentialsInputDto } from '@biblio-num/shared'

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

export const createRandomUsers = (count: number): User[] => {
  const users = []
  for (let i = 1; i <= count; i++) {
    users.push(createRandomUser(i))
  }
  return users
}

export const createRandomAdmin = (): User => ({
  id: faker.helpers.unique(faker.datatype.number, [1000]),
  firstName: faker.internet.userName(),
  lastName: faker.internet.userName(),
  email: faker.internet.email(),
  roles: [{
    id: 1,
    name: 'admin',
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
    name: 'admin_local',
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
    name: 'admin_local',
    description: 'Administrator local',
    permissions: [{ name: 'CREATE_ROLE' }],
    createAt: faker.date.past().toISOString(),
    updateAt: faker.date.past().toISOString(),
  }],
})
