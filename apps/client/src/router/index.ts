import { createRouter, createWebHistory, type RouterOptions } from 'vue-router'

import { useUserStore } from '@/stores'
import { hasAdminAccessGuard, canManageRolesGuard, canAccessDemarchesGuard, isAuthenticatedGuard, isNotAuthenticatedGuard } from '@/shared/guards'

const MAIN_TITLE = 'Bibliothèque Numérique'

export const SIGN_IN_ROUTE_NAME = 'SignIn'

const routes: RouterOptions['routes'] = [
  {
    name: 'Home',
    path: '/',
    meta: {
      needsAuth: true,
    },
    redirect: { name: 'Demarches' },
    children: [],
  },
  {
    name: 'About',
    path: '/a-propos',
    component: () => import('@/views/AboutUs.vue'),
  },
  {
    name: 'Dossiers',
    path: '/dossiers/:id',
    component: () => import('@/views/dossiers/Dossier.vue'),
    meta: {
      needsAuth: true,
    },
  },
  {
    path: '/demarches',
    beforeEnter: [canAccessDemarchesGuard],
    children: [
      {
        path: '',
        name: 'Demarches',
        component: () => import('@/views/demarches/Demarches.vue'),
      },
      {
        path: ':id/dossiers',
        name: 'DemarcheDossiers',
        component: () => import('@/views/demarches/demarche/Demarche.vue'),
        props: true,
        meta: {
          needsAuth: true,
        },
      },
    ],
  },
  {
    name: SIGN_IN_ROUTE_NAME,
    path: '/sign_in',
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/Signin.vue'),
  },
  {
    name: 'SignUp',
    path: '/sign_up',
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/Signup.vue'),
  },
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      needsAuth: true,
    },
  },
  {
    name: 'Statistiques',
    path: '/statistiques',
    component: () => import('@/views/statistics/Statistics.vue'),
    meta: {
      needsAuth: true,
    },
  },
  {
    name: 'LogOut',
    path: '/logout',
    component: () => import('@/views/Logout.vue'),
    meta: {
      needsAuth: true,
    },
  },
  {
    name: 'User',
    path: '/user/:id',
    beforeEnter: [hasAdminAccessGuard],
    component: () => import('@/views/admin/User.vue'),
  },
  {
    name: 'Admin',
    path: '/admin',
    beforeEnter: [canManageRolesGuard],
    component: () => import('@/views/admin/Admin.vue'),
  },
  {
    name: 'Role',
    path: '/role/:id',
    beforeEnter: [canManageRolesGuard],
    component: () => import('@/views/admin/Role.vue'),
    props: (route) => ({
      id: Number(route.params.id),
    }),
  },
  {
    name: 'Organismes',
    path: '/organismes',
    meta: {
      needsAuth: true,
    },
    children: [
      {
        name: 'ListeOrganismes',
        path: '',
        component: () => import('@/views/organismes/list/ListeOrganismes.vue'),
      },
      {
        name: 'FicheOrganisme',
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
      },
    ],
  },
  {
    path: '/update-password/:token',
    name: 'UpdatePassword',
    component: () => import('@/views/UpdatePassword.vue'),
    props: true,
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPassword.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('@/views/Error404.vue'),
  },
  {
    path: '/valid-email/:token',
    name: 'ValidEmail',
    component: () => import('@/views/ValidEmail.vue'),
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
    await userStore.loadCurrentUser()
  }
  if (to.meta?.needsAuth) {
    return isAuthenticatedGuard()
  }
})

export default router
