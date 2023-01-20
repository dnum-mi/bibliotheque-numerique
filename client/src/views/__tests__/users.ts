import { faker } from '@faker-js/faker/locale/fr'
import type { User, UserForm } from '@/shared/interfaces'

export const createRandomUserForm = (): UserForm => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
})

export const createRandomUser = (id?: number): User => ({
  id: id || faker.datatype.number(100),
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
  id: faker.datatype.number(100),
  firstName: faker.internet.userName(),
  lastName: faker.internet.userName(),
  email: faker.internet.email(),
  roles: [{
    id: 1,
    name: 'admin',
    description: 'Administrator',
    createAt: faker.date.past().toISOString(),
    updateAt: faker.date.past().toISOString(),
  }],
})
