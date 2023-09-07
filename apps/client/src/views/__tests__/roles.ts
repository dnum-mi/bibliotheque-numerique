import { faker } from '@faker-js/faker/locale/fr'
import type { IRole } from '@/shared/interfaces'
import { Permissions } from '@/shared/types/Permission.type'
import type { TPermission } from '@/shared/types/Permission.type'

export const getPermissionNumber = () => Object.values(Permissions).length
const allPermissions = Object.values(Permissions).map(permission => ({
  name: permission,
}))
const getRandomPermission = (): TPermission => faker.helpers.arrayElement(allPermissions)
const getRandomPermissions = () => Array.from({ length: faker.datatype.number({ min: 1, max: allPermissions.length }) }, () => getRandomPermission())
export const createRandomRole = (): IRole => ({
  id: faker.helpers.unique(faker.datatype.number, [1000]),
  name: faker.word.noun({ length: { min: 6, max: 10 } }),
  permissions: getRandomPermissions(),
  description: faker.lorem.lines(10),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.past().toISOString(),
})

export const createRandomRoles = (count: number): Map<number, IRole> => {
  const roles = new Map()
  for (let i = 0; i < count; i++) {
    const role = createRandomRole()
    roles.set(role.id, role)
  }
  return roles
}
