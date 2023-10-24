import { useRoute } from 'vue-router'
import { useUserStore } from '../../stores'

export function isAuthenticatedGuard () {
  const userStore = useUserStore()
  if (!userStore.isAuthenticated) {
    return { name: 'SignIn', query: { redirect: location.href.replace(location.origin, '') } }
  }
}

export function hasAdminAccessGuard () {
  const userStore = useUserStore()
  if (!userStore.hasAdminAccess) {
    return { name: 'SignIn', query: { redirect: location.href.replace(location.origin, '') } }
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
  if (!userStore.canAccessDemarches) {
    return { name: 'Profile' }
  }
}

export function isNotAuthenticatedGuard () {
  const userStore = useUserStore()
  if (userStore.isAuthenticated) {
    return '/'
  }
}
