// #region Compare roles
import type { PrefectureKeys } from '../prefectures'
import type { RolesKeys } from './roles.enum'
import { Roles } from './roles.enum'
import type { IRole } from './role.interface'

export const RoleHierarchy: { [key in RolesKeys]: number } = {
  sudo: 0,
  superadmin: 1,
  admin: 2,
  instructor: 3,
  any: 10,
  undefined: 11,
  null: 11,
}

export function isSuperiorOrSimilar(Icompare: RolesKeys, toCompare: RolesKeys | null): boolean {
  return RoleHierarchy[`${toCompare}`] <= RoleHierarchy[Icompare]
}

export const isBelowSuperAdmin = (key: RolesKeys) => !isSuperiorOrSimilar(Roles.superadmin, key)
export const isAtLeastAdmin = (key: RolesKeys) => isSuperiorOrSimilar(Roles.admin, key)
// #endregion

export function canAccessDemarche(id: number, role: IRole): boolean {
  return isSuperiorOrSimilar(Roles.superadmin, role.label) || !!role.options[id]
}

export function canAccessPrefectureInDemarche(prefecture: PrefectureKeys, role: IRole, demarcheId: number): boolean {
  return isSuperiorOrSimilar(Roles.superadmin, role.label)
    || role.options[demarcheId]?.national
    || role.options[demarcheId]?.prefectures?.includes(prefecture)
}
