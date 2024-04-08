import { createEnum } from "../factories"

export const personRoles = [
  "MEMBER_BOARD_DIRECTOR",
  "MEMBER_ADVISORY_COMMITTEE",
  "FUND_EMPLOYEE",
  "NOT_SPECIFIED",
] as const

export type PersonRoleKey = (typeof personRoles)[number]

export const ePersonRole = createEnum(personRoles)
