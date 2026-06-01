import { useUserStore } from '@/stores'
import {
  canAccessByRoleGuard,
  canAccessByDemarcheGuard,
} from '@/shared/guards'

import { routeNames } from './route-names'
import { Roles } from '@biblio-num/shared'
import type { RolesKeys } from '@biblio-num/shared'
import { demarchesRoutes } from '@/router/demarches.route'
import { aboutRoute } from '@/router/about.route'
import { authRoutes } from '@/router/auth.route'
import { dossierRoute } from '@/router/dossier.route'
import { adminRoute } from '@/router/admin.route'
import { profileRoute } from '@/router/profile.route'
import { organismeRoute } from '@/router/organisme.route'
import { passwordRoutes } from '@/router/password.route'
import { statisticRoute } from '@/router/statistic.route'
import { accessibilityRoute } from '@/router/accessibility.route'
import { cookiesRoute } from '@/router/cookies.route'
import { configurationRoute } from './configuration.route'
import { createRouter, createWebHistory } from 'vue-router'
import { useConfigurationStore } from '@/stores/configuration'
import useToaster from '@/composables/use-toaster'
import type { RouteRecordNameGeneric, RouterOptions } from 'vue-router'
import { termsOfUseRoute } from './terms-of-use.route'

const MAIN_TITLE = 'Bibliothèque Numérique'

export const SIGN_IN_ROUTE_NAME = 'SignIn'

const routes: RouterOptions['routes'] = [
  demarchesRoutes,
  dossierRoute,
  organismeRoute,
  adminRoute,
  aboutRoute,
  profileRoute,
  statisticRoute,
  ...authRoutes,
  ...passwordRoutes,
  configurationRoute,
  accessibilityRoute,
  cookiesRoute,
  termsOfUseRoute,
  {
    path: '/:pathMatch(.*)*',
    name: routeNames.Page_404,
    component: () => import('@/views/Error404.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env?.BASE_URL || ''),
  routes,
})

router.beforeEach(async (to) => {
  // Cf. https://github.com/vueuse/head pour des transformations avancées de Head
  const specificTitle = to.meta.title ? `${to.meta.title} - ` : ''
  document.title = `${specificTitle}${MAIN_TITLE}`

  const userStore = useUserStore()
  const configStore = useConfigurationStore()
  const toaster = useToaster()

  if (to.name === routeNames.PROFILE || (!to.meta.skipAuth && !userStore.isAuthenticated)) {
    const isOk: boolean = await userStore.loadMyProfile()
    if (!isOk) {
      return false
    }
  }

  const user = userStore.currentUser
  const isSudo = user?.role?.label === Roles.sudo
  const hasTermsSigned = !!user?.termsAcceptedAt

  if (userStore.isAuthenticated && !isSudo && !hasTermsSigned) {
    const restrictedAllowedRoutes: Partial<RouteRecordNameGeneric>[] = [
      routeNames.PROFILE,
      routeNames.TERMS_OF_USE,
      routeNames.LOGOUT,
    ]

    if (!restrictedAllowedRoutes.includes(to.name)) {
      return { name: routeNames.PROFILE }
    }
  }

  if (userStore.isAuthenticated && !configStore.configClientLoaded) {
    try {
      await configStore.loadClientConfigurations()
    } catch {
      toaster.addErrorMessage({ description: 'Impossible de charger les configurations' })
    }
  }

  const role = user?.role
  if (
    canAccessByRoleGuard(
      to.meta?.roleLevel as RolesKeys | undefined,
      role?.label as RolesKeys | undefined,
    )
    && canAccessByDemarcheGuard(
      to.meta?.needsDemarchesId as boolean | undefined,
      to.params?.demarcheId as string | undefined,
      role,
    )
  ) { return true }

  return { name: routeNames.PROFILE }
})

export default router
