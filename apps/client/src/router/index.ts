import {
  createRouter,
  createWebHistory,
  type RouterOptions,
} from 'vue-router'

import { useUserStore } from '@/stores'
import {
  hasAdminAccessGuard,
  canManageRolesGuard,
  canAccessDemarchesGuard,
  isAuthenticatedGuard,
  isNotAuthenticatedGuard,
  canAccessByRoleGuard,
  canAccessByDemarcheGuard,
} from '@/shared/guards'

import { routeNames } from './route-names'
import type { RolesKeys } from '@biblio-num/shared'
import {
  Roles,
} from '@/biblio-num/shared'
const MAIN_TITLE = 'Bibliothèque Numérique'

export const SIGN_IN_ROUTE_NAME = 'SignIn'

const routes: RouterOptions['routes'] = [
  {
    name: routeNames.HOME,
    path: '/',
    meta: {
      needsAuth: true,
    },
    redirect: { name: routeNames.DEMARCHES },
    children: [],
  },
  {
    name: routeNames.ABOUT,
    path: '/a-propos',
    component: () => import('@/views/AboutUs.vue'),
  },
  {
    name: routeNames.DOSSIERS,
    path: '/dossiers/:id',
    component: () => import('@/views/dossiers/Dossier.vue'),
    meta: {
      needsAuth: true,
    },
  },
  {
    path: '/demarches',
    children: [
      {
        path: '',
        name: routeNames.DEMARCHES,
        component: () => import('@/views/demarches/Demarches.vue'),
        meta: {
          needsAuth: true,
          roleLevel: Roles.instructor,
        },
      },
      {
        path: ':demarcheId/dossiers',
        name: routeNames.DEMARCHE_DOSSIERS,
        component: () => import('@/views/demarches/demarche/Demarche.vue'),
        props: (route) => ({
          id: route.params.id,
          customDisplayId: route.query.customDisplayId,
        }),
        meta: {
          needsAuth: true,
          roleLevel: Roles.instructor,
          needsDemarchesId: true,
        },
      },
    ],
  },
  {
    name: routeNames.SIGNIN,
    path: '/sign_in',
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/authentification/Signin.vue'),
  },
  {
    name: routeNames.SIGNUP,
    path: '/sign_up',
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/authentification/Signup.vue'),
  },
  {
    name: routeNames.PROFILE,
    path: '/profile',
    component: () => import('@/views/profile/Profile.vue'),
    meta: {
      needsAuth: true,
    },
  },
  {
    name: routeNames.STATISTIQUES,
    path: '/statistiques',
    component: () => import('@/views/statistics/Statistics.vue'),
    meta: {
      needsAuth: true,
      roleLevel: Roles.instructor,
    },
  },
  {
    name: routeNames.LOGOUT,
    path: '/logout',
    component: () => import('@/views/authentification/Logout.vue'),
    meta: {
      needsAuth: true,
    },
  },
  {
    name: routeNames.USER,
    path: '/user/:id',
    component: () => import('@/views/admin/User.vue'),
    meta: {
      needsAuth: true,
      roleLevel: Roles.admin,
    },
  },
  {
    name: routeNames.ADMIN,
    path: '/admin',
    component: () => import('@/views/admin/Admin.vue'),
    meta: {
      needsAuth: true,
      roleLevel: Roles.admin,
    },

  },
  // TODO: refacto role
  // {
  //   name: routeNames.ROLE,
  //   path: '/role/:id',
  //   // TODO: refacto role
  //   component: () => import('@/views/admin/Role.vue'),
  //   props: (route) => ({
  //     id: Number(route.params.id),
  //   }),
  // },
  {
    name: routeNames.ORGANISMES,
    path: '/organismes',
    meta: {
      needsAuth: true,
      meta: {
        needsAuth: true,
        roleLevel: Roles.instructor,
      },
    },
    children: [
      {
        name: routeNames.LISTE_ORGANISMES,
        path: '',
        component: () => import('@/views/organismes/list/ListeOrganismes.vue'),
        meta: {
          needsAuth: true,
          roleLevel: Roles.instructor,
        },
      },
      {
        name: routeNames.FICHE_ORGANISME,
        path: ':id',
        component: () => import('@/views/organismes/organisme/FicheOrganisme.vue'),
        props: (route) => {
          const id = route.params.id
          const idType = route.query.idType || 'Id'
          return {
            id,
            idType,
          }
        },
        meta: {
          needsAuth: true,
          roleLevel: Roles.instructor,
        },
      },
    ],
  },
  {
    path: '/update-password/:token',
    name: routeNames.UPDATE_PASSWORD,
    component: () => import('@/views/passwords/UpdatePassword.vue'),
    props: true,
  },
  {
    path: '/reset-password',
    name: routeNames.RESET_PASSWORD,
    component: () => import('@/views/passwords/ResetPassword.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: routeNames.Page_404,
    component: () => import('@/views/Error404.vue'),
  },
  {
    path: '/valid-email/:token',
    name: routeNames.VALIDE_MAIL,
    component: () => import('@/views/passwords/ValidEmail.vue'),
    props: true,

  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env?.BASE_URL || ''),
  routes,
})

router.beforeEach((to) => { // Cf. https://github.com/vueuse/head pour des transformations avancées de Head
  const specificTitle = to.meta.title ? `${to.meta.title} - ` : ''
  document.title = `${specificTitle}${MAIN_TITLE}`
})

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  if (!userStore.loaded) {
    await userStore.loadMyProfile()
  }

  const role = userStore.currentUser?.role
  let next
  if (to.meta?.needsAuth) {
    next = isAuthenticatedGuard()
    if (next) return next

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
  }
})

export default router
