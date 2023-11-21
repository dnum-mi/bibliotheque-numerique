import { PrefectureKeys, Roles, RolesKeys } from '../enums'
import { IRole } from '../interfaces'

/* region Compare roles */
export const RoleHierarchy: { [key in RolesKeys]: number } = {
  sudo: 0,
  superadmin: 1,
  admin: 2,
  instructor: 3,
  any: 10,
  undefined: 11,
  null: 11,
}

export const isSuperiorOrSimilar = (
  comparedTo: RolesKeys,
  toCompare: RolesKeys | null,
): boolean => RoleHierarchy['' + toCompare] <= RoleHierarchy[comparedTo]

export const isBelowSuperAdmin = (key: RolesKeys) => !isSuperiorOrSimilar(Roles.superadmin, key)
export const isAtLeastAdmin = (key: RolesKeys) => isSuperiorOrSimilar(Roles.admin, key)
/* endregion */

export const canAccessDemarche = (id: number, role:IRole): boolean =>
  isSuperiorOrSimilar(Roles.superadmin, role.label) || !!role.options[id]

export const canAccessPrefectureInDemarche = (prefecture: PrefectureKeys, role: IRole, demarcheId: number): boolean =>
  isSuperiorOrSimilar(Roles.superadmin, role.label) ||
  role.options[demarcheId]?.national ||
  role.options[demarcheId]?.prefectures?.includes(prefecture)
