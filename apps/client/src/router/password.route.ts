import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'
import { isNotAuthenticatedGuard } from '@/shared/guards'

export const passwordRoutes: RouteRecordRaw[] = [
  {
    path: '/update-password/:token',
    name: routeNames.UPDATE_PASSWORD,
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/passwords/UpdatePassword.vue'),
    props: true,
    meta: {
      skipAuth: true,
    },
  },
  {
    path: '/reset-password',
    name: routeNames.RESET_PASSWORD,
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/passwords/ResetPassword.vue'),
    meta: {
      skipAuth: true,
    },
  },
  {
    path: '/update-password/to-validate',
    name: routeNames.UPDATE_PASSWORD_TO_VALIDATE,
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/passwords/UpdatePasswordToValidate.vue'),
    meta: {
      skipAuth: true,
    },
  },
]
