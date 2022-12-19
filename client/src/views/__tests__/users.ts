import { faker } from '@faker-js/faker/locale/fr'
import type { User } from '@/shared/interfaces'

export const USERS: User[] = []

export function createRandomUser (): User {
  return {
    _id: faker.datatype.uuid(),
    firstName: faker.internet.userName(),
    lastName: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
}

Array.from({ length: 10 }).forEach(() => {
  USERS.push(createRandomUser())
})
