import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'
import { isNotAuthenticatedGuard } from '@/shared/guards'

export const authRoutes: RouteRecordRaw[] = [
  {
    name: routeNames.PROCONNECT_CALLBACK,
    path: '/login-callback',
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/authentification/ProConnectCallback.vue'),
    meta: {
      skipAuth: true,
    },
  },
  {
    name: routeNames.DOUBLE_AUTH,
    path: '/verify-auth/:token',
    component: () => import('@/views/authentification/VerifyAuth.vue'),
    props: true,
    meta: {
      skipAuth: true,
    },
  },
  {
    name: routeNames.SIGNIN,
    path: '/sign_in',
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/authentification/Signin.vue'),
    meta: {
      skipAuth: true,
    },
  },
  {
    name: routeNames.SIGNUP,
    path: '/sign_up',
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/authentification/Signup.vue'),
    meta: {
      skipAuth: true,
    },
  },
  {
    name: routeNames.LOGOUT,
    path: '/logout',
    component: () => import('@/views/authentification/Logout.vue'),
  },
  {
    path: '/valid-email/:token',
    name: routeNames.VALIDE_MAIL,
    component: () => import('@/views/passwords/ValidEmail.vue'),
    props: true,
    meta: {
      skipAuth: true,
    },
  },
]
