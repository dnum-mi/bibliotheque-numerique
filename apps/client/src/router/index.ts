import type {
  RouterOptions,
} from 'vue-router'
import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import { useUserStore } from '@/stores'
import {
  canAccessByRoleGuard,
  canAccessByDemarcheGuard,
} from '@/shared/guards'

import { routeNames } from './route-names'
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

router.beforeEach(async (to, from) => {
  // Cf. https://github.com/vueuse/head pour des transformations avancées de Head
  const specificTitle = to.meta.title ? `${to.meta.title} - ` : ''
  document.title = `${specificTitle}${MAIN_TITLE}`

  const userStore = useUserStore()
  if (to.name === routeNames.PROFILE || (!to.meta.skipAuth && !userStore.isAuthenticated)) {
    await userStore.loadMyProfile()
  }

  const role = userStore.currentUser?.role
  if (canAccessByRoleGuard(
          to.meta?.roleLevel as RolesKeys | undefined,
          role?.label as RolesKeys | undefined,
  ) &&
    canAccessByDemarcheGuard(
      to.meta?.needsDemarchesId as boolean | undefined,
      to.params?.demarcheId as string | undefined,
      role,
    )
  ) return true
  return { name: routeNames.PROFILE }
})

export default router
