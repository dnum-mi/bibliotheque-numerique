import router, { SIGN_IN_ROUTE_NAME } from '@/router'
import { useUserStore } from '@/stores'

export const getSignInRouteWithRedirect = () => ({
  name: SIGN_IN_ROUTE_NAME,
  query: { redirect: router.currentRoute.value.fullPath || '/' },
})

export const returnToSignIn = () => {
  useUserStore().resetUser()
  router.push(getSignInRouteWithRedirect())
}
