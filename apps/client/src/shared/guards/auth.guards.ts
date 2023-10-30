import { useUserStore } from '@/stores'
import { routeNames } from '@/router/route-names'

export function isAuthenticatedGuard () {
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
