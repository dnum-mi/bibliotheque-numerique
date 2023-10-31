import { Roles, RolesKeys } from '../enums'
import { IRole, IRoleOption } from '../interfaces'

export const RoleHierarchy: { [key in RolesKeys]: number } = {
  sudo: 0,
  superadmin: 1,
  admin: 2,
  instructor: 3,
  any: 10,
  undefined: 11,
}

export const canAccessDemarche = (id: number, role:IRole): boolean => role.options.some((option: IRoleOption) => option.idDemarche === id)

export const canAccessPrefecture = (pref: string, role: IRole): boolean => role.options.some((option: IRoleOption) => option.national || option.prefectures.some(prefecture => prefecture === pref))

export const isSuperiorOrSimilar = (
  comparedTo: RolesKeys,
  toCompare: RolesKeys,
): boolean => RoleHierarchy[toCompare] <= RoleHierarchy[comparedTo]

export const isAtLeastAdmin = (key: RolesKeys) => isSuperiorOrSimilar(Roles.admin, key)
