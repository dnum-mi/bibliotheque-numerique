import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'
import { hasAdminAccessGuard, canManageRolesGuard, isAuthenticatedGuard, isNotAuthenticatedGuard } from '@/shared/guards'

const MAIN_TITLE = 'Bibliothéque Numérique'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/AppHome.vue'),
  },
  {
    path: '/a-propos',
    name: 'About',
    component: () => import('@/views/AboutUs.vue'),
  },
  {
    path: '/demarches/:id/dossiers',
    name: 'DemarcheDossiers',
    beforeEnter: [isAuthenticatedGuard],
    component: () => import('@/views/DemarcheDossiers.vue'),
  },
  {
    path: '/dossiers/:id',
    name: 'Dossier',
    beforeEnter: [isAuthenticatedGuard],
    component: () => import('@/views/Dossier.vue'),
  },
  {
    path: '/demarches',
    name: 'Demarches',
    beforeEnter: [isAuthenticatedGuard],
    component: () => import('@/views/Demarches.vue'),
  },
  {
    path: '/sign_in',
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/Signin.vue'),
  },
  {
    path: '/sign_up',
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/Signup.vue'),
  },
  {
    path: '/profile',
    beforeEnter: [isAuthenticatedGuard],
    component: () => import('@/views/Profile.vue'),
  },
  {
    path: '/logout',
    beforeEnter: [isAuthenticatedGuard],
    component: () => import('@/views/Logout.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    beforeEnter: [canManageRolesGuard],
    component: () => import('@/views/Admin.vue'),
  },
  {
    path: '/user/:id',
    name: 'User',
    beforeEnter: [hasAdminAccessGuard],
    component: () => import('@/views/User.vue'),
  },
  {
    path: '/role/:id',
    name: 'Role',
    beforeEnter: [canManageRolesGuard],
    component: () => import('@/views/Role.vue'),
  },
  {
    path: '/organismes/:id',
    name: 'FicheOrganismes',
    beforeEnter: [isAuthenticatedGuard],
    component: () => import('@/views/FicheOrganisme.vue'),
  },
  {
    path: '/organismes',
    name: 'Organismes',
    beforeEnter: [isAuthenticatedGuard],
    component: () => import('@/views/Organismes.vue'),
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

router.beforeEach(async () => {
  const userStore = useUserStore()
  if (!userStore.loaded) {
    await userStore.loadCurrentUser()
  }
})
export default router
