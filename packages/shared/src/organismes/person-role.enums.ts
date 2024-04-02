import { createEnum } from "../factories"

export const personRoles = [
  'DECLARANT',
  'ADMIN',
  'MANAGER'
] as const

export type PersonRoleKey = (typeof personRoles)[number]

export const ePersonRole = createEnum(personRoles)
