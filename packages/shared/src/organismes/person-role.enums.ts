import { createEnum } from "../factories"

export const personRoles = [
  "MEMBER_BOARD_DIRECTOR",
  "MEMBER_SUPERVIROY_BOARD",
  "MEMBER_MANAGEMENT_BOARD",
  "PERSON_IN_DIRECTOR_POSITION",
  "MEMBER_ADVISORY_COMMITTEE",
  "FUND_EMPLOYEE",
  "NOT_SPECIFIED",
] as const

export type PersonRoleKey = (typeof personRoles)[number]

export const ePersonRole = createEnum(personRoles)

export const creatorRoleKey = 'CREATOR'
export const roleDictionary = {
  [creatorRoleKey]: 'Fondateurs',
  [ePersonRole.MEMBER_BOARD_DIRECTOR]: 'Personne exerçant des fonctions d\'administrateur',
  [ePersonRole.MEMBER_SUPERVIROY_BOARD]: 'Personne exerçant des fonctions de surveillance',
  [ePersonRole.MEMBER_MANAGEMENT_BOARD]: 'Personne exerçant des fonctions de direction',
  [ePersonRole.PERSON_IN_DIRECTOR_POSITION]: 'Personne exerçant des fonctions de direction',
  [ePersonRole.NOT_SPECIFIED]: 'Autres',
}
