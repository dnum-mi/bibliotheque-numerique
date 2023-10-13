import { RoleHierarchy, RolesKeys } from '@biblio-num/shared'

export const isSuperiorOrSimilar = (
  comparedTo: RolesKeys,
  toCompare: RolesKeys,
): boolean => RoleHierarchy[toCompare] <= RoleHierarchy[comparedTo]
