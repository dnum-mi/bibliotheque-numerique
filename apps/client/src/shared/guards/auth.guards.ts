import type { RouteLocationRaw } from 'vue-router'
import { useUserStore } from '@/stores'
import { routeNames } from '@/router/route-names'
import type {
  IRole,
  RolesKeys,
} from '@biblio-num/shared'
import {
  canAccessDemarche,
  isSuperiorOrSimilar,
} from '@/biblio-num/shared'

export function isAuthenticatedGuard (): RouteLocationRaw | undefined {
  const userStore = useUserStore()
  if (!userStore.isAuthenticated) {
    return { name: routeNames.SIGNIN, query: { redirect: location.href.replace(location.origin, '') } }
  }
}

export function hasAdminAccessGuard () {
  const userStore = useUserStore()
  if (!userStore.hasAdminAccess) {
    return { name: routeNames.SIGNIN, query: { redirect: location.href.replace(location.origin, '') } }
  }
}

export function canManageRolesGuard () {
  const userStore = useUserStore()
  if (!userStore.canManageRoles) {
    return '/'
  }
}

export function canAccessDemarchesGuard () {
  const userStore = useUserStore()
  if (!userStore.isAuthenticated) {
    return { name: routeNames.SIGNIN }
  }
  if (!userStore.canAccessDemarches) {
    return { name: routeNames.PROFILE }
  }
}

export function isNotAuthenticatedGuard () {
  const userStore = useUserStore()
  if (userStore.isAuthenticated) {
    return '/'
  }
}

export const canAccessByRoleGuard = (
  comparedTo?: RolesKeys,
  toCompare?: RolesKeys,
) => {
  return (!comparedTo || isSuperiorOrSimilar(comparedTo, toCompare ?? null))
}

export const canAccessByDemarcheGuard = (needDemarchesId?: boolean, demarcheId?:string, role?: IRole) => {
  return !needDemarchesId || (demarcheId && role && canAccessDemarche(+demarcheId, role))
}
