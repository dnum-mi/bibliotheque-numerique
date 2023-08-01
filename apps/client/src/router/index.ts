import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'
import { hasAdminAccessGuard, canManageRolesGuard, canAccessDemarchesGuard, isAuthenticatedGuard, isNotAuthenticatedGuard } from '@/shared/guards'

const MAIN_TITLE = 'Bibliothèque Numérique'

const routes = [
  {
    path: '/',
    name: 'Home',
    beforeEnter: [isAuthenticatedGuard],
    redirect: { name: 'Demarches' },
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
    component: () => import('@/views/demarches/DemarcheDossiers.vue'),
  },
  {
    path: '/dossiers/:id',
    name: 'Dossier',
    beforeEnter: [isAuthenticatedGuard],
    component: () => import('@/views/dossiers/Dossier.vue'),
  },
  {
    path: '/demarches',
    name: 'Demarches',
    beforeEnter: [canAccessDemarchesGuard],
    component: () => import('@/views/demarches/Demarches.vue'),
  },
  {
    path: '/sign_in',
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/Signin.vue'),
    name: 'SignIn',
  },
  {
    path: '/sign_up',
    name: 'signUp',
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/Signup.vue'),
  },
  {
    path: '/profile',
    beforeEnter: [isAuthenticatedGuard],
    component: () => import('@/views/Profile.vue'),
    name: 'Profile',
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
    component: () => import('@/views/admin/Admin.vue'),
  },
  {
    path: '/user/:id',
    name: 'User',
    beforeEnter: [hasAdminAccessGuard],
    component: () => import('@/views/admin/User.vue'),
  },
  {
    path: '/role/:id',
    name: 'Role',
    beforeEnter: [canManageRolesGuard],
    component: () => import('@/views/admin/Role.vue'),
  },
  {
    path: '/organismes/:id',
    name: 'FicheOrganismes',
    beforeEnter: [isAuthenticatedGuard],
    component: () => import('@/views/organismes/FicheOrganisme.vue'),
  },
  {
    path: '/organismes',
    name: 'Organismes',
    beforeEnter: [isAuthenticatedGuard],
    component: () => import('@/views/organismes/Organismes.vue'),
  },
  {
    path: '/update-password/:token',
    name: 'updatePassword',
    component: () => import('@/views/UpdatePassword.vue'),
    props: true,
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    component: () => import('@/views/ResetPassword.vue'),
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
