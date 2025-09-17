import { useUserStore } from '@/stores'

import type {
  IRole,
  RolesKeys,
} from '@biblio-num/shared'
import {
  canAccessDemarche,
  isSuperiorOrSimilar,
} from '@biblio-num/shared'

export async function isNotAuthenticatedGuard () {
  const userStore = useUserStore()

  if (!userStore.isAuthenticated) {
    try {
      await userStore.refreshTokens()
      await userStore.loadMyProfile()
    } catch {
      return true
    }
  }

  if (userStore.isAuthenticated) {
    return '/'
  }

  return true
}

export const canAccessByRoleGuard = (
  comparedTo?: RolesKeys,
  toCompare?: RolesKeys,
) => {
  return (!comparedTo || isSuperiorOrSimilar(comparedTo, toCompare ?? null))
}

export const canAccessByDemarcheGuard = (needDemarchesId?: boolean, demarcheId?: string, role?: IRole) => {
  return !needDemarchesId || (demarcheId && role && canAccessDemarche(+demarcheId, role))
}
