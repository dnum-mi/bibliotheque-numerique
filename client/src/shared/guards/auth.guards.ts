import { useUserStore } from '../../stores'

export function isAuthenticatedGuard () {
  const userStore = useUserStore()
  if (!userStore.isAuthenticated) {
    return '/sign_in'
  }
}

export function hasAdminAccessGuard () {
  const userStore = useUserStore()
  if (!userStore.hasAdminAccess) {
    return '/sign_in'
  }
}

export function isNotAuthenticatedGuard () {
  const userStore = useUserStore()
  if (userStore.isAuthenticated) {
    return '/'
  }
}
