import { faker } from '@faker-js/faker/locale/fr'
import type { IRole } from '@/shared/interfaces'

export const createRandomRole = (): IRole => ({
  id: faker.datatype.number(100),
  name: faker.word.noun({ length: { min: 6, max: 10 } }),
  description: faker.word.noun(10),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.past().toISOString(),
})

export const createRandomRoles = (count: number): IRole[] => {
  const roles = []
  for (let i = 0; i < count; i++) {
    roles.push(createRandomRole())
  }
  return roles
}
