import { createEnum } from "../factories"

export const personRoles = [
  'ADMIN',
  'MANAGER',
  'DECLARANT',
] as const

export type PersonRoleKey = (typeof personRoles)[number]

export const ePersonRole = createEnum(personRoles)
